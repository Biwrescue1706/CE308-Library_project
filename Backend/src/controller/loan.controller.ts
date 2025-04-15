import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

// ✅ ยืมหนังสือ
export const borrowBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user; // มาจาก middleware
    const { bookId } = req.body;

    if (!user) {
      res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
      return;
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      res.status(404).json({ message: "ไม่พบหนังสือ" });
      return;
    }

    if (book.availableCopies <= 0) {
      res.status(400).json({ message: "หนังสือถูกยืมหมดแล้ว" });
      return;
    }

    const loan = await prisma.loan.create({
      data: {
        userId: user.id,
        bookId,
        loanDate: new Date(),
        returned: false,
      },
    });

    await prisma.book.update({
      where: { id: bookId },
      data: {
        availableCopies: { decrement: 1 },
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

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        returned: true,
        returnDate: new Date(),
      },
    });

    await prisma.book.update({
      where: { id: loan.bookId },
      data: {
        availableCopies: { increment: 1 },
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
