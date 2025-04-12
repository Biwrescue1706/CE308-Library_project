import express from "express";
import * as UserController from "../controller/user.controller";

const router = express.Router();

// 📌 กำหนดเส้นทาง API
router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUser);
router.post("/", UserController.createUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

// 📌 เส้นทางเข้าสู่ระบบ
router.post("/login", UserController.loginUser);

export default router;
