import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

// Middleware: ตรวจสอบ token ที่อยู่ใน cookie
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: "คุณยังไม่ได้เข้าสู่ระบบ" });
    return;
  }

  try {
    const user = verifyToken(token);
    (req as any).user = user; // ✅ inject user เข้า req
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    res.status(403).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
};
