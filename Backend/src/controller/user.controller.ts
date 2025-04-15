import { Request, Response } from "express";
import * as UserService from "../service/user.service";
import { z, ZodError } from "zod";
import { prisma } from "../utils/prisma";
import { generateToken } from "../utils/jwt";

// 📌 Zod schema สำหรับ validate ข้อมูลผู้ใช้
const userSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  username: z.string().min(3, "ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  titleTH: z.string().min(1),
  firstNameTH: z.string().min(1),
  lastNameTH: z.string().min(1),
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

// 📌 สร้าง memberId ฟอร์แมต MEM-xxxx-xxxx-xxxx
function generateMemberId(): string {
  const part = () => Math.floor(1000 + Math.random() * 9000).toString();
  return `MEM-${part()}-${part()}-${part()}`;
}

// ✅ สมัครสมาชิก
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = userSchema.parse(req.body);

    const newUser = await UserService.createUser({
      ...validated,
      memberId: generateMemberId(),
      registrationDate: new Date(),
    });

    res.status(201).json(newUser);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.errors });
    } else {
      console.error(err);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
    }
  }
};

// ✅ เข้าสู่ระบบด้วย username หรือ email
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = await UserService.loginUserByUsernameOrEmail(username, password);

    if (!user) {
      res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // ✅ ใส่ token ใน cookie
    res.cookie("token", token, {
      httpOnly: true,       // ปลอดภัยจาก XSS
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",      // ป้องกัน CSRF ระดับหนึ่ง
      maxAge: 30 * 60 * 1000 // 30 นาที    

    });

    res.json({ message: "เข้าสู่ระบบสำเร็จ", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};


// ✅ อัปเดตข้อมูลผู้ใช้
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


export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "ออกจากระบบเรียบร้อย" });
};

export const getMe = (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ user });
};