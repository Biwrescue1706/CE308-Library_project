import { prisma } from "../utils/prisma";

export const getCartItems = async (userId: string) => {
  return prisma.cart.findMany({
    where: { userId },
    include: { book: true },
  });
};

export const addToCart = async (userId: string, bookId: string) => {
  const existing = await prisma.cart.findFirst({ where: { userId, bookId } });
  if (existing) throw new Error("หนังสือนี้อยู่ในตะกร้าแล้ว");
  return prisma.cart.create({ data: { userId, bookId } });
};

export const removeFromCart = async (userId: string, bookId: string) => {
  return prisma.cart.deleteMany({ where: { userId, bookId } });
};

export const clearCart = async (userId: string) => {
  return prisma.cart.deleteMany({ where: { userId } });
};
