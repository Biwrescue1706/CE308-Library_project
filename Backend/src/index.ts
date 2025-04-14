import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 📌 Import Routes
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import bookRoutes from "./routes/book.routes";
// import loanRoutes from "./routes/loan.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000 ;

app.use(cors());
app.use(express.json());

// 📌 กำหนดเส้นทาง API
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/books", bookRoutes);

// ✅ แสดงข้อความเมื่อเปิดเซิร์ฟเวอร์
app.get("/", (_req, res) => {
    res.send("📚 Library API is running...");
});


app.listen(PORT, '0.0.0.0' ,() =>{
console.log(` Server running on http://0.0.0.0:${PORT}`);
});