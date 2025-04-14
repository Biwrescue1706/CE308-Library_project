
import { Request, Response } from "express";
import * as UserService from "../service/user.service";
import { z } from "zod";

// 📌 Zod schema สำหรับ validate ข้อมูลผู้ใช
const userSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  memberId: z.string().min(1, "กรุณากรอกรหัสสมาชิก"),
  username: z.string().min(3, "ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  titleTH: z.string(),
  firstNameTH: z.string(),
  lastNameTH: z.string(),
  titleEN: z.string().optional(),
  firstNameEN: z.string().optional(),
  lastNameEN: z.string().optional(),
  birthDate: z.coerce.date({ required_error: "กรุณาระบุวันเกิด" }),
  phone: z.string().min(9, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
  role: z.enum(["admin", "user"]).default("user"),
});

// ✅ สมัครสมาชิก
export const register = async (req: Request, res: Response) => {
  try {
    const newUser = await UserService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
};