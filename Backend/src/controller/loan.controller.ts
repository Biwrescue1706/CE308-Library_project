import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import * as LoanService from "../service/loan.service";
import { differenceInDays, addDays } from "date-fns";
import axios from "axios";

// 🟢 LINE Messaging API
const LINE_API_URL = "https://api.line.me/v2/bot/message/push";
const LINE_GROUP_ID = "C5ea2bec79706873f7212a1dccd5c6702"; // 🔁 แทนที่ด้วย groupId จริง
const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ||
  "WBtqkdSyTJvF/CUH3UWiseH+Q61cmSJ8bQctxurcN4jDWZaeCii0Pfh27BM88S5wJ6GMyCocVk1/ns70lnsTLLTLy1jLiFjLATYgetkNgW6ZShb1/3Yint3caetYvC8BjUxEqoGyPs/4mH6ZIlMs7wdB04t89/1O/w1cDnyilFU=";

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
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ ไม่สามารถส่ง LINE ได้:", error.response?.data || error.message);
    } else {
      console.error("❌ ไม่สามารถส่ง LINE ได้:", error);
    }
  }
};

// ✅ ยืมหนังสือ
export const borrowBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { bookId, quantity } = req.body;

    if (!user) {
      res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
      return
    }
    if (!bookId || !quantity || quantity <= 0) {
      res.status(400).json({ message: "กรุณาระบุรหัสหนังสือและจำนวนที่ต้องการยืมให้ถูกต้อง" });
      return
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      res.status(404).json({ message: "ไม่พบหนังสือ" });
      return
    }

    if (book.availableCopies < quantity) {
      res.status(400).json({ message: "จำนวนหนังสือไม่เพียงพอสำหรับการยืม" });
      return
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
        availableCopies: { decrement: quantity },
      },
    });

    // 🟢 ส่งแจ้งเตือนไปยัง LINE group
    await sendLineMessage(
      `📚 ยืมหนังสือ\n` +
      `ผู้ใช้: ${user.username}\n` +
      `ชื่อหนังสือ: ${book.title}\n` +
      `จำนวน: ${quantity} เล่ม\n` +
      `วันที่ยืม: ${now.toLocaleDateString("th-TH")}\n` +
      `ครบกำหนดคืน: ${dueDate.toLocaleDateString("th-TH")}`
    );

    res.status(201).json({ message: "ยืมหนังสือสำเร็จ", loan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการยืมหนังสือ" });
  }
};

// 📦 ยืมหนังสือหลายเล่มในครั้งเดียว
export const borrowMultiple = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const items: { bookId: string; quantity: number }[] = req.body.items;

    if (!user) {
      res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "กรุณาระบุรายการหนังสือที่ต้องการยืม" });
      return;
    }

    // ดึงรายละเอียดหนังสือทั้งหมดที่ยืม
    const bookIds = items.map((item) => item.bookId);
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, title: true },
    });

    // ยืมหนังสือทั้งหมด
    const loans = await LoanService.borrowMultipleBooks(user.id, items);

    // แปลงข้อมูลสำหรับ LINE
    const now = new Date();
    const dueDate = addDays(now, 7);
    const bookLines = items.map((item) => {
      const matchedBook = books.find((b) => b.id === item.bookId);
      return `- ${matchedBook?.title || "ไม่พบชื่อหนังสือ"} (${item.quantity} เล่ม)`;
    }).join("\n");

    await sendLineMessage(
      `📚 ยืมหนังสือหลายรายการ\n` +
      `ผู้ใช้: ${user.username}\n` +
      `วันที่ยืม: ${now.toLocaleDateString("th-TH")}\n` +
      `ครบกำหนดคืน: ${dueDate.toLocaleDateString("th-TH")}\n` +
      `รายการ:\n${bookLines}`
    );

    res.status(201).json({ message: "ยืมหนังสือหลายรายการสำเร็จ", loans });
  } catch (error: any) {
    console.error("❌ borrowMultiple error:", error.message);
    res.status(500).json({ message: error.message || "เกิดข้อผิดพลาดในการยืมหลายรายการ" });
  }
};


// ✅ คืนหนังสือ
export const returnBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        user: true,
        book: true,
      },
    });

    if (!loan || loan.returned) {
      res.status(400).json({ message: "ไม่พบการยืม หรือคืนไปแล้ว" });
      return
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

    // 🟢 แจ้งเตือนคืน
    await sendLineMessage(
      `✅ คืนหนังสือ\n` +
      `ผู้ใช้: ${loan.user.username}\n` +
      `ชื่อหนังสือ: ${loan.book.title}\n` +
      `จำนวน: ${loan.quantity} เล่ม\n` +
      `วันที่ยืม: ${loan.loanDate.toLocaleDateString("th-TH")}\n` +
      `วันที่คืน: ${returnDate.toLocaleDateString("th-TH")}\n` +
      `${lateDays > 0 ? `⏰ เกินกำหนด ${lateDays} วัน` : "🟢 คืนตรงเวลา"}`
    );
    
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
        book: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        loanDate: "desc",
      },
    });

    const result = loans.map((loan) => ({
      id: loan.id,
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
    const user = (req as any).user;
    if (user.role !== "admin") {
      res.status(403).json({ message: "เฉพาะแอดมินเท่านั้นที่เข้าถึงได้" });
      return;
    }
    const loans = await prisma.loan.findMany({
      where: { returned: false },
      include: {
        user: {
          select:
          {
            username: true,
            titleTH: true,
            firstNameTH: true,
            lastNameTH: true,
            phone: true,
            memberId: true,
          }
        },
        book: {
          select:
          {
            title: true,
          }
        },
      },
      orderBy: {
        loanDate: "desc",
      },
    });

    const result = loans.map((loan) => ({
      id: loan.id,
      memberId: loan.user.memberId,
      username: loan.user.username,
      title: loan.book.title,
      quantity: loan.quantity,
      loanDate: loan.loanDate,
      phone: loan.user.phone,
      fullNameTH: `${loan.user.titleTH}${loan.user.firstNameTH} ${loan.user.lastNameTH}`,
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

// ✅ ดูเฉพาะรายการยืมที่ค้างคืน
export const getOverdueLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    if (user.role !== "admin") {
      res.status(403).json({ message: "เฉพาะแอดมินเท่านั้นที่เข้าถึงได้" });
      return;
    }

    const today = new Date();

    const overdueLoans = await prisma.loan.findMany({
      where: {
        returned: false,
        dueDate: {
          lt: today,
        },
      },
      include: {
        user: {
          select: {
            username: true,
            titleTH: true,
            firstNameTH: true,
            lastNameTH: true,
            phone: true,
            memberId: true,
          },
        },
        book: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    const result = overdueLoans.map((loan) => ({
      id: loan.id,
      memberId: loan.user.memberId,
      username: loan.user.username,
      phone: loan.user.phone,
      fullNameTH: `${loan.user.titleTH}${loan.user.firstNameTH} ${loan.user.lastNameTH}`,
      title: loan.book.title,
      quantity: loan.quantity,
      loanDate: loan.loanDate,
      dueDate: loan.dueDate,
      returnDate: loan.returnDate,
      returned: loan.returned,
      lateDays: differenceInDays(today, loan.dueDate!),
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Error in getOverdueLoans:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการเกินกำหนดคืน" });
  }
};

