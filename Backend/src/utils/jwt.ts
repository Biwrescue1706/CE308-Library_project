import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30m" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

