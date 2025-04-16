import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ✅ สร้างผู้ใช้ใหม่ (เข้ารหัสรหัสผ่านก่อนบันทึก)
export const createUser = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });

  return user;
};

// ✅ เข้าสู่ระบบด้วย username หรือ email
export const loginUserByUsernameOrEmail = async (usernameOrEmail: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ],
    },
  });

  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  return user;
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

export const getUserLoanHistory = async (userId: string) => {
  return prisma.loan.findMany({
    where: { userId },
    include: {
      book: true, // รวมข้อมูลหนังสือที่ยืมมาด้วย
    },
    orderBy: {
      loanDate: "desc", // เรียงจากล่าสุด
    },
  });
};

// ✅ ดึงข้อมูลผู้ใช้ทั้งหมดโดยใช้ userId (ใช้กับ getMe)
export const getUserByIdWithProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      memberId: true,
      titleTH: true,
      firstNameTH: true,
      lastNameTH: true,
      titleEN: true,
      firstNameEN: true,
      lastNameEN: true,
      birthDate: true,
      phone: true,
      registrationDate: true,
      houseNumber: true,
      villageNo: true,
      alley: true,
      street: true,
      subdistrict: true,
      district: true,
      province: true,
      postalCode: true,
    },
  });
};

