import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 ดึงข้อมูลผู้ใช้ทั้งหมด
export const getAllUsers = async (page: number = 1, pageSize: number = 10) => {
  const skip = (page - 1) * pageSize;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      include: { address: true },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / pageSize),
  };
};

// 📌 ดึงข้อมูลผู้ใช้ตาม ID
export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    include: { address: true },
  });
};

// 📌 ดึงข้อมูลผู้ใช้ตาม username (ใช้สำหรับ login)
export const getUserByUsername = async (username: string) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};

// 📌 สร้างผู้ใช้ใหม่
export const createUser = async (data: any) => {
  return await prisma.user.create({ data });
};

// 📌 อัปเดตข้อมูลผู้ใช้
export const updateUser = async (id: string, data: any) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

// 📌 ลบผู้ใช้
export const deleteUser = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
  });
};
