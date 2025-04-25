import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

// 📌 ดูตะกร้า
export const getCartItems = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const items = await prisma.cart.findMany({
    where: { userId: user.id },
    include: { book: true },
  });
  res.json(items);
};

// 📌 เพิ่มหนังสือลงตะกร้า และลด availableCopies
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { bookId, quantity } = req.body;
  const qty = quantity ?? 1;

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || book.availableCopies < qty) {
    res.status(400).json({ message: "หนังสือคงเหลือไม่พอ" });
    return
  }

  const existing = await prisma.cart.findFirst({
    where: { userId: user.id, bookId },
  });

  if (existing) {
    res.status(400).json({ message: "หนังสือนี้อยู่ในตะกร้าแล้ว" });
    return
  }

  const item = await prisma.cart.create({
    data: { userId: user.id, bookId, quantity: qty },
  });

  await prisma.book.update({
    where: { id: bookId },
    data: { availableCopies: { decrement: qty } },
  });

  res.status(201).json(item);
};

// 📌 ลบหนังสือออกจากตะกร้า และคืน availableCopies
export const removeFromCart = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { bookId } = req.params;

  const cartItem = await prisma.cart.findFirst({
    where: { userId: user.id, bookId },
  });

  if (cartItem) {
    await prisma.book.update({
      where: { id: bookId },
      data: { availableCopies: { increment: cartItem.quantity } },
    });

    await prisma.cart.deleteMany({ where: { userId: user.id, bookId } });
  }

  res.json({ message: "ลบออกจากตะกร้าสำเร็จ" });
};

// 📌 ล้างตะกร้าทั้งหมด และคืน availableCopies
export const clearCart = async (req: Request, res: Response) => {
  const user = (req as any).user;

  const items = await prisma.cart.findMany({
    where: { userId: user.id },
  });

  for (const item of items) {
    await prisma.book.update({
      where: { id: item.bookId },
      data: { availableCopies: { increment: item.quantity } },
    });
  }

  await prisma.cart.deleteMany({ where: { userId: user.id } });

  res.json({ message: "ล้างตะกร้าสำเร็จ" });
};

// 📌 อัปเดตจำนวน และจัดการ availableCopies ด้วย
export const updateQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;
    const user = (req as any).user;

    if (quantity <= 0) {
      res.status(400).json({ message: "จำนวนต้องมากกว่า 0" });
      return
    }

    const cartItem = await prisma.cart.findFirst({
      where: { userId: user.id, bookId },
    });

    if (!cartItem) {
      res.status(404).json({ message: "ไม่พบรายการในตะกร้า" });
      return
    }

    const diff = quantity - cartItem.quantity;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      res.status(404).json({ message: "ไม่พบหนังสือ" });
      return
    }

    if (diff > 0 && book.availableCopies < diff) {
      res.status(400).json({ message: "หนังสือคงเหลือไม่พอ" });
      return
    }

    // ปรับ availableCopies ตาม diff
    await prisma.book.update({
      where: { id: bookId },
      data: {
        availableCopies: {
          [diff > 0 ? "decrement" : "increment"]: Math.abs(diff),
        },
      },
    });

    await prisma.cart.updateMany({
      where: { userId: user.id, bookId },
      data: { quantity },
    });

    res.json({ message: "อัปเดตจำนวนสำเร็จ" });
  } catch (err) {
    console.error("❌ updateQuantity error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตจำนวน" });
  }
};
