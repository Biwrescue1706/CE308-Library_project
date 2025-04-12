import { Request, Response } from "express";
import * as BookService from "../service/book.service";
import { z, ZodError } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Schema สำหรับตรวจสอบข้อมูลหนังสือ
const BookSchema = z.object({
    title: z.string().min(1, "จำเป็นต้องมีชื่อเรื่อง"),
    author: z.string().min(1, "จำเป็นต้องมีผู้เขียน"),
    description: z.string().optional(),
    category: z.string().min(1, "หมวดหมู่เป็นสิ่งจำเป็น"),
    totalCopies: z.number().int().positive("จำนวนสำเนาทั้งหมดต้องเป็นค่าบวก"),
    availableCopies: z.number().optional()
});

// 📌 ดึงหนังสือทั้งหมด
export const getBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const books = await BookService.getAllBooks();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงหนังสือ" });
    }
};

// 📌 ดึงหนังสือตาม ID
export const getBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const book = await BookService.getBookById(id);
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ error: "ไม่พบหนังสือ" });
        }
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงหนังสือ" });
    }
};

// 📌 เพิ่มหนังสือใหม่
export const createBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = BookSchema.parse(req.body);
        const bookData = {
            ...validatedData,
            availableCopies: validatedData.availableCopies ?? validatedData.totalCopies,
        };
        const book = await BookService.createBook(bookData);
        res.status(201).json(book);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ error: error.issues });
        } else {
            res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มหนังสือ" });
        }
    }
};

// 📌 อัปเดตหนังสือ
export const updateBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = BookSchema.partial().parse(req.body);
        const book = await BookService.updateBook(req.params.id, validatedData);
        res.json(book);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ error: error.issues });
        } else {
            res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตหนังสือ" });
        }
    }
};

// 📌 ลบหนังสือ
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
        await BookService.deleteBook(req.params.id);
        res.json({ message: "ลบหนังสือเรียบร้อย" });
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบหนังสือ" });
    }
};
