"use strict";
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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserByUsername = exports.getUserById = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// 📌 ดึงข้อมูลผู้ใช้ทั้งหมด
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.findMany({ include: { address: true } });
});
exports.getAllUsers = getAllUsers;
// 📌 ดึงข้อมูลผู้ใช้ตาม ID
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.findUnique({
        where: { id },
        include: { address: true },
    });
});
exports.getUserById = getUserById;
// 📌 ดึงข้อมูลผู้ใช้ตาม username (ใช้สำหรับ login)
const getUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.findUnique({
        where: { username },
    });
});
exports.getUserByUsername = getUserByUsername;
// 📌 สร้างผู้ใช้ใหม่
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.create({ data });
});
exports.createUser = createUser;
// 📌 อัปเดตข้อมูลผู้ใช้
const updateUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.update({
        where: { id },
        data,
    });
});
exports.updateUser = updateUser;
// 📌 ลบผู้ใช้
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.delete({
        where: { id },
    });
});
exports.deleteUser = deleteUser;
