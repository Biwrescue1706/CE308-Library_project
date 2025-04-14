import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ✅ สร้างผู้ใช้ใหม่ (เข้ารหัสรหัสผ่านก่อนบันทึก)
export const createUser = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
};

// ✅ เข้าสู่ระบบด้วย username หรือ email
export const loginUserByUsernameOrEmail = async (usernameOrEmail: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    }
  });

  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch ? user : null;
};

// ✅ อัปเดตข้อมูลผู้ใช้ (โดยใช้ username)
export const updateUserByUsername = async (username: string, data: any) => {
  return prisma.user.update({
    where: { username },
    data,
  });
};

// ✅ ลบผู้ใช้ (โดยใช้ username)
export const deleteUserByUsername = async (username: string) => {
  return prisma.user.delete({
    where: { username },
  });
};