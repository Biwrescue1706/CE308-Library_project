// 📁 src/routes/user.routes.ts
import express from "express";
import * as UserController from "../controller/user.controller";

const router = express.Router();

// ✅ สมัครสมาชิก
router.post("/register", UserController.register);

// ✅ เข้าสู่ระบบ
router.post("/login", UserController.login);

// ✅ อัปเดตข้อมูลผู้ใช้ (ส่ง :username)
router.put("/update/:username", UserController.updateProfile);

// ✅ ลบผู้ใช้ (ส่ง :username)
router.delete("/delete/:username", UserController.deleteUser);

export default router;
