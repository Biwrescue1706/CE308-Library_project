import express from "express";
import * as UserController from "../controller/user.controller";
import { authenticateToken, isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

// 📌 ต้องใช้ token ถึงเรียกใช้งานได้

// ✅ ดึงผู้ใช้ทั้งหมด (Admin เท่านั้น)
router.get("/", authenticateToken, isAdmin, UserController.getUsers);
// ✅ ดึงผู้ใช้ตาม ID (Admin หรือเจ้าของข้อมูล)
router.get("/:id", authenticateToken, UserController.getUser);
// ✅ เพิ่มผู้ใช้ใหม่ (เช่น สมัครสมาชิกจาก Admin หรือหน้า Register)
router.post("/", UserController.createUser);
// ✅ แก้ไขข้อมูลผู้ใช้
router.put("/:id", authenticateToken, UserController.updateUser);
// ✅ ลบผู้ใช้ (Admin เท่านั้น)
router.delete("/:id", authenticateToken, isAdmin, UserController.deleteUser);

export default router;