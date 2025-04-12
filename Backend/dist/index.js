"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const book_routes_1 = __importDefault(require("./routes/book.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 📌 กำหนดเส้นทาง API
app.use("/api/books", book_routes_1.default);
app.use("/api/users", user_routes_1.default);
// ✅ แสดงข้อความเมื่อเปิดเซิร์ฟเวอร์
app.get("", (_req, res) => {
    res.send("📚 Library API is running...");
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
