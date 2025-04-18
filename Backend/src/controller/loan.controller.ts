import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import * as LoanService from "../service/loan.service";
import { differenceInDays, addDays } from "date-fns";

// ✅ ยืมหนังสือ
export const borrowBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user; // มาจาก middleware
    const { bookId, quantity } = req.body;

    if (!user) {
      res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
      return;
    }

    if (!bookId || !quantity || quantity <= 0) {
      res.status(400).json({ message: "กรุณาระบุรหัสหนังสือและจำนวนที่ต้องการยืมให้ถูกต้อง" });
      return;
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      res.status(404).json({ message: "ไม่พบหนังสือ" });
      return;
    }

    if (book.availableCopies < quantity) {
      res.status(400).json({ message: "จำนวนหนังสือไม่เพียงพอสำหรับการยืม" });
      return;
    }

    const now = new Date();
    const dueDate = addDays(now, 7);

    const loan = await prisma.loan.create({
      data: {
        userId: user.id,
        bookId,
        loanDate: now,
        dueDate,
        returned: false,
        quantity,
      },
    });

    await prisma.book.update({
      where: { id: bookId },
      data: {
        availableCopies: {
          decrement: quantity,
        },
      },
    });

    res.status(201).json({ message: "ยืมหนังสือสำเร็จ", loan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการยืมหนังสือ" });
  }
};

// ✅ คืนหนังสือ
export const returnBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const loan = await prisma.loan.findUnique({
      where: { id },
    });

    if (!loan || loan.returned) {
      res.status(400).json({ message: "ไม่พบการยืม หรือคืนไปแล้ว" });
      return;
    }

    const returnDate = new Date();
    let lateDays = 0;
    if (loan.dueDate) {
      lateDays = Math.max(differenceInDays(returnDate, loan.dueDate), 0);
    }

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        returned: true,
        returnDate,
        lateDays,
      },
    });

    await prisma.book.update({
      where: { id: loan.bookId },
      data: {
        availableCopies: { increment: loan.quantity },
      },
    });

    res.json({ message: "คืนหนังสือสำเร็จ", loan: updatedLoan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการคืนหนังสือ" });
  }
};

// ✅ ดูรายการหนังสือที่ยืม
export const getLoansByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
      return;
    }

    const loans = await prisma.loan.findMany({
      where: { userId: user.id },
      include: {
        book: true,
      },
      orderBy: {
        loanDate: "desc",
      },
    });

    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการยืมหนังสือ" });
  }
};

// ✅ ดูรายการยืมทั้งหมด (admin เท่านั้น)
export const getAllLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      res.status(403).json({ message: "เฉพาะแอดมินเท่านั้นที่เข้าถึงได้" });
      return;
    }

    const loans = await prisma.loan.findMany({
      include: {
        user: { select: { username: true } },
        book: { select: { title: true } },
      },
      orderBy: {
        loanDate: "desc",
      },
    });

    const result = loans.map((loan) => ({
      id: loan.id,
      username: loan.user.username,
      title: loan.book.title,
      quantity: loan.quantity,
      loanDate: loan.loanDate,
      dueDate: loan.dueDate,
      returnDate: loan.returnDate,
      returned: loan.returned,
      lateDays: loan.lateDays,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching all loans:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

// ✅ ดูเฉพาะรายการยืมที่ยังไม่คืน
export const getActiveLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    const loans = await prisma.loan.findMany({
      where: { returned: false },
      include: {
        user: { select: { username: true } },
        book: { select: { title: true } },
      },
      orderBy: {
        loanDate: "desc",
      },
    });

    const result = loans.map((loan) => ({
      id: loan.id,
      username: loan.user.username,
      title: loan.book.title,
      quantity: loan.quantity,
      loanDate: loan.loanDate,
      dueDate: loan.dueDate,
      returnDate: loan.returnDate,
      returned: loan.returned,
      lateDays: loan.lateDays,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching active loans:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};
