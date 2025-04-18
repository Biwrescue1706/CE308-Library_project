// 📁 src/routes/user.routes.ts
import express from "express";
import * as UserController from "../controller/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

// ✅ สมัครสมาชิก
router.post("/register", UserController.register);

// ✅ เข้าสู่ระบบด้วย username หรือ email
router.post("/login", UserController.login);

// ✅ อัปเดตข้อมูลผู้ใช้ (ใช้ username เป็น param)
router.put("/update/:username", authenticate, UserController.updateProfile);

// ✅ ลบผู้ใช้
router.delete("/delete/:username", authenticate, UserController.deleteUser);

// ✅ ออกจากระบบ
router.post("/logout", UserController.logout);

// ✅ ดึงข้อมูลผู้ใช้ (ต้อง login แล้ว)
router.get("/me", authenticate, UserController.getMe);

// ✅ ประวัติการยืมหนังสือของผู้ใช้ที่ login
router.get("/history", authenticate, UserController.getHistory);

// ✅ ลืมรหัสผ่าน
router.post("/forgot-password", UserController.forgotPassword);

// ✅ ตั้งรหัสผ่านใหม่
router.post("/reset-password", UserController.resetPassword);

// ✅ เปลี่ยนรหัสผ่านขณะ login
router.post("/change-password", authenticate, UserController.changePassword);

export default router;
