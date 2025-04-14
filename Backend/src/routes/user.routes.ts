import express from "express";
import * as UserController from "../controller/user.controller";
import { authenticateToken, isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", authenticateToken, isAdmin, UserController.getUsers);
router.get("/:id", authenticateToken, UserController.getUser);
router.post("/", UserController.createUser);
router.put("/:id", authenticateToken, UserController.updateUser);
router.delete("/:id", authenticateToken, isAdmin, UserController.deleteUser);
router.post("/login", UserController.loginUser);

export default router;