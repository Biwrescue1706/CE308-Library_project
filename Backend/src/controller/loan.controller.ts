import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import * as LoanService from "../service/loan.service";
import { differenceInDays, addDays, format } from "date-fns";
import { th } from "date-fns/locale";
import axios from "axios";
import { promises } from "dns";

// LINE Messaging API
const LINE_API_URL = "https://api.line.me/v2/bot/message/push";
const LINE_GROUP_ID = "C5ea2bec79706873f7212a1dccd5c6702";
const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "WBtqkdSyTJvF/CUH3UWiseH+Q61cmSJ8bQctxurcN4jDWZaeCii0Pfh27BM88S5wJ6GMyCocVk1/ns70lnsTLLTLy1jLiFjLATYgetkNgW6ZShb1/3Yint3caetYvC8BjUxEqoGyPs/4mH6ZIlMs7wdB04t89/1O/w1cDnyilFU=";

const sendLineMessage = async (message: string) => {
  try {
    await axios.post(
      LINE_API_URL,
      {
        to: LINE_GROUP_ID,
        messages: [{ type: "text", text: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${LINE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("❌ ไม่สามารถส่ง LINE ได้:", error.response?.data || error.message);
  }
};

const formatThaiDate = (date: Date) => {
  return format(date, "d MMMM yyyy", { locale: th }).replace(/[0-9]{4}$/, (year) => `${parseInt(year) + 543}`);
};

// ✅ ยืมหนังสือเล่มเดียว
export const borrowBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { bookId, borrowedQuantity } = req.body;

    if (!user || !bookId || !borrowedQuantity || borrowedQuantity <= 0) {
      res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" }); return
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      res.status(404).json({ message: "ไม่พบหนังสือ" });
      return
    }
    if (book.availableCopies < borrowedQuantity) {
      res.status(400).json({ message: "จำนวนหนังสือไม่เพียงพอ" });
      return
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

    await sendLineMessage(
      `📚 ยืมหนังสือ\n` +
      `ผู้ใช้: ${user.username}\n` +
      `ชื่อหนังสือ: ${book.title}\n` +
      `จำนวน: ${borrowedQuantity} เล่ม\n` +
      `วันที่ยืม: ${formatThaiDate(now)}\n` +
      `ครบกำหนดคืน: ${formatThaiDate(dueDate)}`
    );

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
      return
    }

    const items = rawItems.map((item: any) => ({
      bookId: item.bookId,
      quantity: item.borrowedQuantity,
    }));

    const bookIds = rawItems.map((item: any) => item.bookId);
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, title: true },
    });

    const loans = await LoanService.borrowMultipleBooks(user.id, items);

    const now = new Date();
    const dueDate = addDays(now, 7);
    const bookLines = rawItems
      .map((item: any) => {
        const matched = books.find((b) => b.id === item.bookId);
        return `- ${matched?.title || "ไม่พบชื่อหนังสือ"} (${item.borrowedQuantity} เล่ม)`;
      })
      .join("\n");

    await sendLineMessage(
      `📚 ยืมหนังสือหลายรายการ\n` +
      `ผู้ใช้: ${user.username}\n` +
      `วันที่ยืม: ${formatThaiDate(now)}\n` +
      `ครบกำหนดคืน: ${formatThaiDate(dueDate)}\n` +
      `รายการ:\n${bookLines}`
    );

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

    if (isFullyReturned) {
      await sendLineMessage(
        `✅ คืนหนังสือ\n` +
        `ผู้ใช้: ${loan.user.username}\n` +
        `ชื่อหนังสือ: ${loan.book.title}\n` +
        `จำนวน: ${loan.borrowedQuantity} เล่ม\n` +
        `วันที่ยืม: ${formatThaiDate(loan.loanDate)}\n` +
        `วันที่คืน: ${formatThaiDate(now)}\n` +
        `${lateDays > 0 ? `⏰ เกินกำหนด ${lateDays} วัน` : "🟢 คืนตรงเวลา"}`
      );
    }

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
    const { returnData } = req.body; // [{ loanId, quantity }]

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
    const bookListText = filtered.map(item =>
      `- ${item!.title} (${item!.quantity} เล่ม)${item!.lateDays > 0 ? ` ⏰ เกิน ${item!.lateDays} วัน` : ""}`
    ).join("\n");

    await sendLineMessage(
      `✅ คืนหนังสือทั้งหมด\n` +
      `ผู้ใช้: ${user.username}\n` +
      `วันที่คืน: ${formatThaiDate(now)}\n` +
      `รายการที่คืน:\n${bookListText}`
    );

    res.json({ message: "คืนหนังสือทั้งหมดสำเร็จ", returnedBooks: filtered });
  } catch (err) {
    console.error("❌ returnAllBooks error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการคืนทั้งหมด" });
  }
};

// ✅ รายการยืมของตัวเอง// ✅ รายการยืมของตัวเอง
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
