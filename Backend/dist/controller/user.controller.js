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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const UserService = __importStar(require("../service/user.service"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";
// 📌 ดึงข้อมูลผู้ใช้ทั้งหมด
const getUsers = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield UserService.getAllUsers();
        return res.json(users);
    }
    catch (error) {
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
    }
});
exports.getUsers = getUsers;
// 📌 ดึงข้อมูลผู้ใช้ตาม ID
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield UserService.getUserById(req.params.id);
        if (!user)
            return res.status(404).json({ error: "ไม่พบผู้ใช้" });
        return res.json(user);
    }
    catch (error) {
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
    }
});
exports.getUser = getUser;
// 📌 สร้างผู้ใช้ใหม่ (เข้ารหัสรหัสผ่าน)
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { password } = _a, restData = __rest(_a, ["password"]);
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield UserService.createUser(Object.assign(Object.assign({}, restData), { password: hashedPassword }));
        return res.status(201).json(newUser);
    }
    catch (error) {
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการสร้างผู้ใช้" });
    }
});
exports.createUser = createUser;
// 📌 อัปเดตข้อมูลผู้ใช้
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedUser = yield UserService.updateUser(req.params.id, req.body);
        return res.json(updatedUser);
    }
    catch (error) {
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้" });
    }
});
exports.updateUser = updateUser;
// 📌 ลบผู้ใช้
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield UserService.deleteUser(req.params.id);
        return res.json({ message: "ลบผู้ใช้สำเร็จ" });
    }
    catch (error) {
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบผู้ใช้" });
    }
});
exports.deleteUser = deleteUser;
// 📌 เข้าสู่ระบบ (Login) และออก Token
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield UserService.getUserByUsername(username);
        if (!user)
            return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        // ✅ สร้าง Token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
            expiresIn: "1h",
        });
        return res.json({ token, user });
    }
    catch (error) {
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    }
});
exports.loginUser = loginUser;
