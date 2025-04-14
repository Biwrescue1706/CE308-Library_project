
import { Request, Response } from "express";
import * as UserService from "../service/user.service";
import { z, ZodError } from "zod";

// 📌 Zod schema สำหรับ validate ข้อมูลผู้ใช
const userSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  memberId: z.string().min(1, "กรุณาระบุรหัสสมาชิก"),
  username: z.string().min(3, "ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  titleTH: z.string().min(1, "กรุณาระบุคำนำหน้า (ไทย)"),
  firstNameTH: z.string().min(1, "กรุณาระบุชื่อ (ไทย)"),
  lastNameTH: z.string().min(1, "กรุณาระบุนามสกุล (ไทย)"),
  titleEN: z.string().optional(),
  firstNameEN: z.string().optional(),
  lastNameEN: z.string().optional(),
  birthDate: z.coerce.date({ required_error: "กรุณาระบุวันเกิด" }),
  phone: z.string().min(9, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
  houseNumber: z.string().optional(),
  villageNo: z.string().optional(),
  alley: z.string().optional(),
  street: z.string().optional(),
  subdistrict: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  role: z.enum(["admin", "user"]).default("user"),
});

// ✅ สมัครสมาชิก
export const register = async (req: Request, res: Response) => {
  try {
    const validated = userSchema.parse({
      ...req.body,
      role: "user", // กำหนด role เป็น user เสมอ
    });

    const newUser = await UserService.createUser({
      ...validated,
      registrationDate: new Date(),
    });

    res.status(201).json(newUser);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
};

// ✅ เข้าสู่ระบบ
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await UserService.loginUser(username, password);

    if (!user) {
      return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    res.json({ user, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};

// ✅ อัปเดตข้อมูลผู้ใช้ (อิงจาก username)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const updatedUser = await UserService.updateUserByUsername(req.params.username, req.body);
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้" });
  }
};

// ✅ ลบผู้ใช้
export const deleteUser = async (req: Request, res: Response) => {
  try {
    await UserService.deleteUserByUsername(req.params.username);
    res.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบผู้ใช้" });
  }
};