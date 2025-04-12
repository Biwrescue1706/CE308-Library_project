import { Request, Response } from "express";
import * as UserService from "../service/user.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔐 กำหนด SECRET KEY สำหรับ JWT
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// 📌 ดึงผู้ใช้ทั้งหมด (admin เท่านั้น)
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
  }
};

// 📌 ดึงผู้ใช้ตาม ID (admin หรือเจ้าของข้อมูล)
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
  }
};

// 📌 สมัครผู้ใช้ใหม่ (hash password ก่อนบันทึก)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { password, ...restData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserService.createUser({
      ...restData,
      password: hashedPassword,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการสร้างผู้ใช้" });
  }
};

// 📌 แก้ไขข้อมูลผู้ใช้ (admin หรือเจ้าของข้อมูล)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await UserService.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้" });
  }
};

// 📌 ลบผู้ใช้ (admin เท่านั้น)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบผู้ใช้" });
  }
};

// 📌 เข้าสู่ระบบ (login) และออก JWT token
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await UserService.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};
