import { Request, Response } from "express";
import * as UserService from "../service/user.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// 📌 ดึงข้อมูลผู้ใช้ทั้งหมด
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
  }
};

// 📌 ดึงข้อมูลผู้ใช้ตาม ID
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "ไม่พบผู้ใช้" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
  }
};

// 📌 สร้างผู้ใช้ใหม่ (เข้ารหัสรหัสผ่าน)
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

// 📌 อัปเดตข้อมูลผู้ใช้
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await UserService.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้" });
  }
};

// 📌 ลบผู้ใช้
export const deleteUser = async (req: Request, res: Response) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบผู้ใช้" });
  }
};

// 📌 เข้าสู่ระบบ (Login) และออก Token
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await UserService.getUserByUsername(username);
    
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
