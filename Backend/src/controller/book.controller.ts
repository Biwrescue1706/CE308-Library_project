import { Request, Response } from "express";
import * as BookService from "../service/book.service";
import { prisma } from "../utils/prisma";
import { z, ZodError } from "zod";



// 📌 Zod schema สำหรับ validate ข้อมูลหนังสือ
const BookSchema = z.object({
  title: z.string().min(1, "จำเป็นต้องมีชื่อเรื่อง"),
  author: z.string().min(1, "จำเป็นต้องมีผู้เขียน"),
  description: z.string().optional(),
  category: z.string().min(1, "หมวดหมู่เป็นสิ่งจำเป็น"),
  totalCopies: z.number().int().positive("จำนวนสำเนาทั้งหมดต้องเป็นค่าบวก"),
  availableCopies: z.number().optional(),
});

// 📚 ดึงหนังสือทั้งหมด
export const getBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await BookService.getAllBooks();
    res.json(books);
    return
  } catch {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงหนังสือทั้งหมด" });
  }
};

// 📚 ดึงหนังสือตาม ID
export const getBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      res.status(404).json({ error: "ไม่พบหนังสือ" });
      return
    }
    res.json(book);
  } catch {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงหนังสือ" });
  }
};

// ➕ เพิ่มหนังสือใหม่
export const createBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user; // ✅ มาจาก token ที่ middleware แปะไว้

    if (!user || user.role !== "admin") {
      res.status(403).json({ message: "คุณไม่มีสิทธิ์เพิ่มหนังสือ" });
      return
    }

    const validated = BookSchema.parse(req.body);

    const bookData = {
      ...validated,
      availableCopies: validated.availableCopies ?? validated.totalCopies,
      createdById: user.id, // ✅ ดึงจาก token แทน
    };

    const book = await BookService.createBook(bookData);
    res.status(201).json(book);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มหนังสือ" });
    }
  }
};


// ✏️ อัปเดตหนังสือ
export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user || user.role !== "admin") {
      res.status(403).json({ message: "คุณไม่มีสิทธิ์แก้ไขหนังสือ" });
      return
    }

    const validated = BookSchema.partial().parse(req.body);

    const bookData = {
      ...validated,
      updatedById: user.id, // ✅ ดึงจาก token แทน
    };

    const book = await BookService.updateBook(req.params.id, bookData);
    res.json(book);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตหนังสือ" });
    }
  }
};


// ❌ ลบหนังสือ
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  try {
    await BookService.deleteBook(req.params.id);

    const user = (req as any).user;
    if (!user || user.role !== "admin") {
      res.status(403).json({ message: "คุณไม่มีสิทธิ์ลบหนังสือ" });
      return;
    }

    res.json({ message: "ลบหนังสือเรียบร้อยแล้ว" });
  } catch {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบหนังสือ" });
  }
};
