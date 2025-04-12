import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// 📌 Middleware ตรวจสอบ JWT Token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access Denied" });
    return; // ✅ ต้องใช้ `return` เพื่อหยุดการทำงาน
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string; role: string };
    (req as any).user = decoded; // ✅ ใช้ `as any` ชั่วคราวเพื่อให้ TypeScript ไม่ error
    next(); // ✅ ต้องเรียก `next()` เสมอ เพื่อไปยัง Controller ถัดไป
  } catch (error) {
    res.status(403).json({ error: "Invalid Token" });
    return; // ✅ หยุดการทำงานของ middleware
  }
};
