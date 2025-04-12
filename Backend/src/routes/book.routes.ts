import express from "express";
import * as BookController from "../controller/book.controller";

const router = express.Router();

// ✅ เส้นทางค้นหาต้องมาก่อน `/books/:id`
router.get("/", BookController.getBooks);
router.get("/:id", BookController.getBook);
router.post("/", BookController.createBook);
router.put("/:id", BookController.updateBook);
router.delete("/:id", BookController.deleteBook);

export default router;