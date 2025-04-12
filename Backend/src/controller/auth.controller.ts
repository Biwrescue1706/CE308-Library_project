import { Request, Response } from "express";
import * as AuthService from "../service/auth.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// 📌 ลงทะเบียนผู้ใช้ใหม่
export const register = async (req: Request, res: Response) => {
  try {
    const { password, ...restData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await AuthService.register({
      ...restData,
      password: hashedPassword,
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลงทะเบียน" });
  }
};

// 📌 เข้าสู่ระบบ (Login)
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await AuthService.getUserByUsername(username);

    if (!user) {
      res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    // ✅ สร้าง Token
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};

// 📌 ตรวจสอบ Token และคืนข้อมูลผู้ใช้
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId; // ✅ ใช้ `as any` แก้ปัญหา TypeScript
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await AuthService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้" });
  }
};