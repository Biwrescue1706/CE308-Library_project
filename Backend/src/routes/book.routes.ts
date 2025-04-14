import express from "express";
import * as BookController from "../controller/book.controller";

const router = express.Router();

// 📚 Routes สำหรับหนังสือ
router.get("/getAllBooks", BookController.getBooks);         // ดึงหนังสือทั้งหมด
router.get("/getBooks/:id", BookController.getBook);       // ดึงหนังสือตาม ID
router.post("/createBooks", BookController.createBook);      // เพิ่มหนังสือ
router.put("/editBooks/:id", BookController.updateBook);    // แก้ไขหนังสือ
router.delete("/deleteBooks/:id", BookController.deleteBook); // ลบหนังสือ

export default router;
