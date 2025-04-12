// 📁 src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// 📌 เพิ่ม Type ให้กับ req.user
interface JwtPayload {
  userId: string;
  role: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

// 📌 ตรวจสอบว่า Token ถูกต้อง
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access Denied: No Token Provided" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or Expired Token" });
  }
};

// 📌 Middleware ตรวจว่าเป็น Admin หรือไม่
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === "user") {
    return next();
  }
  return res.status(403).json({ error: "Forbidden: user only" });
};
