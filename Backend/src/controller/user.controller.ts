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
    const { usernameOrEmail, password } = req.body;
    const user = await UserService.loginUserByUsernameOrEmail(usernameOrEmail, password);

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

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await UserService.getUserByIdWithProfile(userId); // ✅ เรียกจาก service

    if (!user) {
      res.status(404).json({ error: "ไม่พบผู้ใช้" });
      return
    }

    res.json({ user });
  } catch (err) {
    console.error("❌ Error in getMe:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
  }
};

// ✅ ดึงประวัติการยืมหนังสือของผู้ใช้
export const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const history = await prisma.loan.findMany({
      where: { userId },
      include: {
        book: true,
      },
      orderBy: {
        loanDate: "desc", // ✅ ใช้ loanDate ตาม schema ของคุณ
      },
    });

    res.json({ history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถดึงประวัติการยืมได้" });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { usernameOrEmail } = req.body;
  const user = await UserService.findUserByUsernameOrEmail(usernameOrEmail);

  if (!user) {
    res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
    return;
  }

  res.status(200).json({ message: "พบผู้ใช้งาน", userId: user.id });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { userId, newPassword } = req.body;
  const updated = await UserService.resetUserPassword(userId, newPassword);
  if (!updated) {
    res.status(400).json({ message: "เปลี่ยนรหัสผ่านไม่สำเร็จ" });
    return;
  }
  res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { newPassword } = req.body;
  const userId = (req as any).user.id;

  const updated = await UserService.resetUserPassword(userId, newPassword);
  if (!updated) {
    res.status(400).json({ message: "ไม่สามารถเปลี่ยนรหัสผ่านได้" });
    return;
  }

  res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = (req as any).user?.role;

    if (role !== "admin") {
      res.status(403).json({ error: "ไม่ได้รับอนุญาต" });
      return;
    }

    const users = await UserService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching all users:", err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" });
  }
};