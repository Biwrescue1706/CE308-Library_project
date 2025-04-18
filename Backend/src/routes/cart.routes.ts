import express from "express";
import * as CartController from "../controller/cart.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/cart", authenticate, CartController.getCartItems);
router.post("/add", authenticate, CartController.addToCart);
router.delete("/remove/:bookId", authenticate, CartController.removeFromCart);
router.delete("/clear", authenticate, CartController.clearCart);

export default router;