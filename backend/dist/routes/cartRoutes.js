"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartController_1 = require("../controllers/cartController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.protect, cartController_1.getCart);
router.post('/sync', authMiddleware_1.protect, cartController_1.syncCart);
router.post('/add', authMiddleware_1.protect, cartController_1.addToCart);
router.put('/:productId', authMiddleware_1.protect, cartController_1.updateCartItem);
router.delete('/:productId', authMiddleware_1.protect, cartController_1.removeFromCart);
exports.default = router;
