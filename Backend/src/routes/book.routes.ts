import express from "express";
import * as BookController from "../controller/book.controller";
import {authenticate} from "../middleware/auth.middleware";

const router = express.Router();

// 📚 Routes สำหรับหนังสือ
// ดึงหนังสือทั้งหมด
router.get("/getAllBooks", BookController.getBooks);         
// ดึงหนังสือตาม ID
router.get("/getBooks/:id", BookController.getBook);       
// เพิ่มหนังสือ
router.post("/create", authenticate, BookController.createBook);    
// แก้ไขหนังสือ 
router.put("/editBooks/:id" , authenticate , BookController.updateBook); 
// ลบหนังสือ   
router.delete("/deleteBooks/:id", authenticate , BookController.deleteBook); 

export default router;
