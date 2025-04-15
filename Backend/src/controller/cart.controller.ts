import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const getCartItems = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const items = await prisma.cart.findMany({
    where: { userId: user.id },
    include: { book: true },
  });
  res.json(items);
};

export const addToCart = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { bookId } = req.body;

  const existing = await prisma.cart.findFirst({
    where: { userId: user.id, bookId },
  });

  if (existing) {
    res.status(400).json({ message: "หนังสือนี้อยู่ในตะกร้าแล้ว" });
    return;
  }

  const item = await prisma.cart.create({
    data: { userId: user.id, bookId },
  });

  res.status(201).json(item);
};

export const removeFromCart = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { bookId } = req.params;

  await prisma.cart.deleteMany({
    where: { userId: user.id, bookId },
  });

  res.json({ message: "ลบออกจากตะกร้าสำเร็จ" });
};

export const clearCart = async (req: Request, res: Response) => {
  const user = (req as any).user;

  await prisma.cart.deleteMany({
    where: { userId: user.id },
  });

  res.json({ message: "ล้างตะกร้าสำเร็จ" });
};
