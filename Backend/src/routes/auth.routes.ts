import express from "express";
import * as AuthController from "../controller/auth.controller";
import { authenticate  } from "../middleware/auth.middleware"; // ✅ ใช้ `{}`

const router = express.Router();

// 📌 เส้นทางสำหรับ Authentication
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
// router.get("/me", authenticateToken , AuthController.getProfile); // ✅ แก้ไขลำดับ middleware

export default router;
