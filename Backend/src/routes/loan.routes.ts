import express from "express";
import * as LoanController from "../controller/loan.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/borrow", authenticate, LoanController.borrowBook);
router.post("/return/:id", authenticate, LoanController.returnBook);
router.get("/my-loans", authenticate, LoanController.getLoansByUser);
router.post("/borrow-multiple", authenticate, LoanController.borrowMultiple);
// ✅ ดูการยืมทั้งหมด (admin เท่านั้น)
router.get("/all", authenticate, LoanController.getAllLoans);

// ✅ ดูเฉพาะรายการยืมที่ยังไม่คืน(admin เท่านั้น)
router.get("/active", authenticate, LoanController.getActiveLoans);

// ✅ ดูเฉพาะรายการที่เลยกำหนดคืน (Overdue) (admin เท่านั้น)
router.get("/overdue", authenticate, LoanController.getOverdueLoans);

export default router;
