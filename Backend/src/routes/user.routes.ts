// 📁 src/routes/user.routes.ts
import express from "express";
import * as UserController from "../controller/user.controller";
import {authenticate} from "../middleware/auth.middleware";

const router = express.Router();

// ✅ สมัครสมาชิก
router.post("/register", UserController.register);

// ✅ เข้าสู่ระบบด้วย username หรือ email
router.post("/login", UserController.login);

// ✅ อัปเดตข้อมูลผู้ใช้ (ใช้ username เป็น param)
router.put("/update/:username" , authenticate , UserController.updateProfile);

// ✅ ลบผู้ใช้
router.delete("/delete/:username" , authenticate, UserController.deleteUser);

router.post("/logout", UserController.logout);

router.get("/me", authenticate, UserController.getMe);

export default router;
