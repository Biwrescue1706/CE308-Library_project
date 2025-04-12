"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBook = exports.updateBook = exports.createBook = exports.getBook = exports.getBooks = void 0;
const BookService = __importStar(require("../service/book.service"));
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// 📌 Schema สำหรับตรวจสอบข้อมูลหนังสือ
const BookSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "จำเป็นต้องมีชื่อเรื่อง"),
    author: zod_1.z.string().min(1, "จำเป็นต้องมีผู้เขียน"),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1, "หมวดหมู่เป็นสิ่งจำเป็น"),
    totalCopies: zod_1.z.number().int().positive("จำนวนสำเนาทั้งหมดต้องเป็นค่าบวก"),
    availableCopies: zod_1.z.number().optional()
});
// 📌 ดึงหนังสือทั้งหมด
const getBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const books = yield BookService.getAllBooks();
        res.json(books);
    }
    catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงหนังสือ" });
    }
});
exports.getBooks = getBooks;
// 📌 ดึงหนังสือตาม ID
const getBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const book = yield BookService.getBookById(id);
        if (book) {
            res.json(book);
        }
        else {
            res.status(404).json({ error: "ไม่พบหนังสือ" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงหนังสือ" });
    }
});
exports.getBook = getBook;
// 📌 เพิ่มหนังสือใหม่
const createBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const validatedData = BookSchema.parse(req.body);
        const bookData = Object.assign(Object.assign({}, validatedData), { availableCopies: (_a = validatedData.availableCopies) !== null && _a !== void 0 ? _a : validatedData.totalCopies });
        const book = yield BookService.createBook(bookData);
        res.status(201).json(book);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({ error: error.issues });
        }
        else {
            res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มหนังสือ" });
        }
    }
});
exports.createBook = createBook;
// 📌 อัปเดตหนังสือ
const updateBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = BookSchema.partial().parse(req.body);
        const book = yield BookService.updateBook(req.params.id, validatedData);
        res.json(book);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({ error: error.issues });
        }
        else {
            res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตหนังสือ" });
        }
    }
});
exports.updateBook = updateBook;
// 📌 ลบหนังสือ
const deleteBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield BookService.deleteBook(req.params.id);
        res.json({ message: "ลบหนังสือเรียบร้อย" });
    }
    catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบหนังสือ" });
    }
});
exports.deleteBook = deleteBook;
