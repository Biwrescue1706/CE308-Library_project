import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// 📌 Import Routes
import userRoutes from "./routes/user.routes";
import bookRoutes from "./routes/book.routes";
import loanRoutes from "./routes/loan.routes";
import cartRoutes from "./routes/cart.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000 ;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// 📌 กำหนดเส้นทาง API
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/cart", cartRoutes);

// ✅ แสดงข้อความเมื่อเปิดเซิร์ฟเวอร์
app.get("/", (req, res) => {
    res.send("📚 Library API is running...");
});

app.listen(PORT, '0.0.0.0' ,() =>{
console.log(`Server running at http://localhost:${PORT}`);
});