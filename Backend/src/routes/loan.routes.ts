import express from "express";
import * as LoanController from "../controller/loan.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/borrow", authenticate, LoanController.borrowBook);
router.post("/return/:id", authenticate, LoanController.returnBook);
router.get("/my-loans", authenticate, LoanController.getLoansByUser);
// ✅ ดูการยืมทั้งหมด (admin เท่านั้น)
router.get("/all", authenticate, LoanController.getAllLoans);

// ✅ ดูเฉพาะรายการยืมที่ยังไม่คืน
router.get("/active", authenticate, LoanController.getActiveLoans);


export default router;
