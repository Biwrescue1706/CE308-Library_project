import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import * as LoanService from "../service/loan.service";
import { differenceInDays, addDays, format } from "date-fns";
import { th } from "date-fns/locale";

const formatThaiDate = (date: Date) => {
  return format(date, "d MMMM yyyy", { locale: th }).replace(/[0-9]{4}$/, (year) => `${parseInt(year) + 543}`);
};

// ✅ ยืมหนังสือเล่มเดียว
export const borrowBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { bookId, borrowedQuantity } = req.body;

    if (!user || !bookId || !borrowedQuantity || borrowedQuantity <= 0) {
      res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
      return;
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      res.status(404).json({ message: "ไม่พบหนังสือ" });
      return;
    }
    if (book.availableCopies < borrowedQuantity) {
      res.status(400).json({ message: "จำนวนหนังสือไม่เพียงพอ" });
      return;
    }

    const now = new Date();
    const dueDate = addDays(now, 7);

    const loan = await prisma.loan.create({
      data: {
        userId: user.id,
        bookId,
        borrowedQuantity,
        loanDate: now,
        dueDate,
        returned: false,
      },
    });

    await prisma.book.update({
      where: { id: bookId },
      data: { availableCopies: { decrement: borrowedQuantity } },
    });

    res.status(201).json({ message: "ยืมหนังสือสำเร็จ", loan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการยืมหนังสือ" });
  }
};

// ✅ ยืมหลายเล่ม
export const borrowMultiple = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const rawItems = req.body.item;

    if (!user || !Array.isArray(rawItems) || rawItems.length === 0) {
      res.status(400).json({ message: "กรุณาระบุรายการหนังสือ" });
      return;
    }

    const items = rawItems.map((item: any) => ({
      bookId: item.bookId,
      quantity: item.borrowedQuantity,
    }));

    const loans = await LoanService.borrowMultipleBooks(user.id, items);

    res.status(201).json({ message: "ยืมหนังสือหลายรายการสำเร็จ", loans });
  } catch (error: any) {
    console.error("❌ borrowMultiple error:", error.message);
    res.status(500).json({ message: error.message || "เกิดข้อผิดพลาดในการยืมหลายรายการ" });
  }
};

// ✅ คืนหนังสือ (บางเล่ม)
export const returnBook = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: { user: true, book: true },
    });

    if (!loan || loan.returned) {
      res.status(400).json({ message: "ไม่พบหรือคืนครบแล้ว" });
      return;
    }

    const remaining = loan.borrowedQuantity - loan.returnedQuantity;
    const returnQty = Math.min(quantity || remaining, remaining);
    const updatedReturned = loan.returnedQuantity + returnQty;
    const isFullyReturned = updatedReturned >= loan.borrowedQuantity;
    const now = new Date();
    const lateDays = isFullyReturned && loan.dueDate
      ? Math.max(differenceInDays(now, loan.dueDate), 0)
      : loan.lateDays ?? 0;

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        returnedQuantity: updatedReturned,
        ...(isFullyReturned && {
          returned: true,
          returnDate: now,
          lateDays,
        }),
      },
    });

    await prisma.book.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: returnQty } },
    });

    res.json({ message: "คืนหนังสือสำเร็จ", loan: updatedLoan });
  } catch (err) {
    console.error("❌ Error returnBook:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการคืนหนังสือ" });
  }
};

// ✅ คืนทั้งหมด
export const returnAllBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { returnData } = req.body;

    if (!Array.isArray(returnData) || returnData.length === 0) {
      res.status(400).json({ message: "ไม่มีข้อมูลรายการคืน" });
      return;
    }

    const now = new Date();
    const returnedBooks = await Promise.all(
      returnData.map(async ({ loanId, quantity }) => {
        const loan = await prisma.loan.findUnique({
          where: { id: loanId },
          include: { book: true },
        });

        if (!loan || loan.returned || loan.userId !== user.id) return null;

        const remaining = loan.borrowedQuantity - loan.returnedQuantity;
        const returnQty = Math.min(quantity, remaining);
        const updatedReturned = loan.returnedQuantity + returnQty;
        const isFullyReturned = updatedReturned >= loan.borrowedQuantity;
        const lateDays = isFullyReturned && loan.dueDate
          ? Math.max(differenceInDays(now, loan.dueDate), 0)
          : loan.lateDays ?? 0;

        await prisma.loan.update({
          where: { id: loanId },
          data: {
            returnedQuantity: updatedReturned,
            ...(isFullyReturned && {
              returned: true,
              returnDate: now,
              lateDays,
            }),
          },
        });

        await prisma.book.update({
          where: { id: loan.bookId },
          data: { availableCopies: { increment: returnQty } },
        });

        return {
          title: loan.book.title,
          quantity: returnQty,
          lateDays: isFullyReturned ? lateDays : 0,
        };
      })
    );

    const filtered = returnedBooks.filter(Boolean);
    res.json({ message: "คืนหนังสือทั้งหมดสำเร็จ", returnedBooks: filtered });
  } catch (err) {
    console.error("❌ returnAllBooks error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการคืนทั้งหมด" });
  }
};

// ✅ รายการยืมของตัวเอง
export const getLoansByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const loans = await prisma.loan.findMany({
      where: { userId: user.id },
      include: { book: { select: { title: true } } },
      orderBy: { loanDate: "desc" },
    });

    res.json(loans.map((loan) => ({
      id: loan.id,
      title: loan.book.title,
      borrowedQuantity: loan.borrowedQuantity,
      returnedQuantity: loan.returnedQuantity,
      loanDate: formatThaiDate(loan.loanDate),
      dueDate: loan.dueDate ? formatThaiDate(loan.dueDate) : null,
      returnDate: loan.returnDate ? formatThaiDate(loan.returnDate) : null,
      returned: loan.returned,
      lateDays: loan.lateDays ?? 0,
    })));
  } catch (err) {
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้" });
  }
};

// ✅ รายการยืมทั้งหมด (admin)
export const getAllLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      res.status(403).json({ message: "เฉพาะแอดมินเท่านั้น" });
      return
    }

    const loans = await prisma.loan.findMany({
      include: {
        user: {
          select: {
            memberId: true,
            username: true,
            titleTH: true,
            firstNameTH: true,
            lastNameTH: true,
            phone: true,
          },
        },
        book: {
          select:
          {
            title: true
          }
        },
      },
      orderBy: [
        { loanDate: "desc" },
        { returnDate: "desc" }
      ]
    });

    res.json(loans.map((loan) => ({
      id: loan.id,
      title: loan.book.title,
      username: loan.user.username,
      memberId: loan.user.memberId,
      fullNameTH: `${loan.user.titleTH}${loan.user.firstNameTH} ${loan.user.lastNameTH}`,
      phone: loan.user.phone,
      borrowedQuantity: loan.borrowedQuantity,
      returnedQuantity: loan.returnedQuantity,
      loanDate: formatThaiDate(loan.loanDate),
      dueDate: loan.dueDate ? formatThaiDate(loan.dueDate) : null,
      returnDate: loan.returnDate ? formatThaiDate(loan.returnDate) : null,
      returned: loan.returned,
      lateDays: loan.lateDays ?? 0,
    })));
  } catch (err) {
    console.error("❌ getAllLoans error:", err);
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้" });
  }
};

// ✅ รายการยืมที่ยังไม่คืน (admin)
export const getActiveLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      res.status(403).json({ message: "เฉพาะแอดมินเท่านั้น" });
      return
    }

    const loans = await prisma.loan.findMany({
      where: { returned: false },
      include: {
        user: {
          select: {
            memberId: true,
            username: true,
            titleTH: true,
            firstNameTH: true,
            lastNameTH: true,
            phone: true,
          },
        },
        book: {
          select:
          {
            title: true
          }
        },
      },
      orderBy: [
        { loanDate: "desc" },
        { returnDate: "desc" }
      ]
    });

    res.json(loans.map((loan) => ({
      id: loan.id,
      title: loan.book.title,
      username: loan.user.username,
      memberId: loan.user.memberId,
      fullNameTH: `${loan.user.titleTH}${loan.user.firstNameTH} ${loan.user.lastNameTH}`,
      phone: loan.user.phone,
      borrowedQuantity: loan.borrowedQuantity,
      returnedQuantity: loan.returnedQuantity,
      loanDate: formatThaiDate(loan.loanDate),
      dueDate: loan.dueDate ? formatThaiDate(loan.dueDate) : null,
    })));
  } catch (err) {
    console.error("❌ getActiveLoans error:", err);
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้" });
  }
};

// ✅ รายการยืมเกินกำหนดคืน (admin)
export const getOverdueLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      res.status(403).json({ message: "เฉพาะแอดมินเท่านั้น" });
      return
    }


    const today = new Date();

    const loans = await prisma.loan.findMany({
      where: {
        returned: false,
        dueDate: { lt: today },
      },
      include: {
        user: {
          select: {
            memberId: true,
            username: true,
            titleTH: true,
            firstNameTH: true,
            lastNameTH: true,
            phone: true,
          },
        },
        book: { select: { title: true } },
      },
      orderBy: [
        { loanDate: "desc" },
        { returnDate: "desc" }
      ]
    });

    res.json(loans.map((loan) => ({
      id: loan.id,
      title: loan.book.title,
      username: loan.user.username,
      memberId: loan.user.memberId,
      fullNameTH: `${loan.user.titleTH}${loan.user.firstNameTH} ${loan.user.lastNameTH}`,
      phone: loan.user.phone,
      borrowedQuantity: loan.borrowedQuantity,
      returnedQuantity: loan.returnedQuantity,
      loanDate: formatThaiDate(loan.loanDate),
      dueDate: loan.dueDate ? formatThaiDate(loan.dueDate) : null,
      lateDays: differenceInDays(today, loan.dueDate!),
    })));
  } catch (err) {
    console.error("❌ getOverdueLoans error:", err);
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้" });
  }
};
