import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 ลงทะเบียนผู้ใช้ใหม่
export const register = async (userData: any) => {
  return await prisma.user.create({ data: userData });
};

// 📌 ค้นหาผู้ใช้โดย Username
export const getUserByUsername = async (username: string) => {
  return await prisma.user.findUnique({ where: { username } });
};

// 📌 ค้นหาผู้ใช้โดย ID
export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({ where: { id } });
};
