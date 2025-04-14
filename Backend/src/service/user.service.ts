import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ✅ สร้างผู้ใช้ใหม่
export const createUser = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
};

// ✅ เข้าสู่ระบบ
export const loginUser = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { username } });
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