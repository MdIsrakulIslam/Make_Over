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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.syncCart = exports.getCart = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        let cart = yield prisma_1.default.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!cart) {
            cart = yield prisma_1.default.cart.create({
                data: { userId },
                include: { items: { include: { product: true } } }
            });
        }
        res.status(200).json(cart);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});
exports.getCart = getCart;
const syncCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { items } = req.body;
        let cart = yield prisma_1.default.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = yield prisma_1.default.cart.create({ data: { userId } });
        }
        if (items && Array.isArray(items)) {
            for (const item of items) {
                const existingItem = yield prisma_1.default.cartItem.findUnique({
                    where: {
                        cartId_productId: {
                            cartId: cart.id,
                            productId: item.id
                        }
                    }
                });
                if (existingItem) {
                    yield prisma_1.default.cartItem.update({
                        where: { id: existingItem.id },
                        data: { quantity: existingItem.quantity + item.quantity }
                    });
                }
                else {
                    yield prisma_1.default.cartItem.create({
                        data: {
                            cartId: cart.id,
                            productId: item.id,
                            quantity: item.quantity
                        }
                    });
                }
            }
        }
        const updatedCart = yield prisma_1.default.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });
        res.status(200).json(updatedCart);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});
exports.syncCart = syncCart;
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { productId, quantity } = req.body;
        let cart = yield prisma_1.default.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = yield prisma_1.default.cart.create({ data: { userId } });
        }
        const existingItem = yield prisma_1.default.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            }
        });
        if (existingItem) {
            yield prisma_1.default.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + (quantity || 1) }
            });
        }
        else {
            yield prisma_1.default.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity: quantity || 1
                }
            });
        }
        const updatedCart = yield prisma_1.default.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });
        res.status(200).json(updatedCart);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});
exports.addToCart = addToCart;
const updateCartItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const productId = req.params.productId;
        const { amount } = req.body;
        const cart = yield prisma_1.default.cart.findUnique({ where: { userId } });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        const existingItem = yield prisma_1.default.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            }
        });
        if (!existingItem) {
            return res.status(404).json({ error: 'Item not in cart' });
        }
        const newQuantity = existingItem.quantity + amount;
        if (newQuantity <= 0) {
            yield prisma_1.default.cartItem.delete({ where: { id: existingItem.id } });
        }
        else {
            yield prisma_1.default.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity }
            });
        }
        const updatedCart = yield prisma_1.default.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });
        res.status(200).json(updatedCart);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});
exports.updateCartItem = updateCartItem;
const removeFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const productId = req.params.productId;
        const cart = yield prisma_1.default.cart.findUnique({ where: { userId } });
        if (cart) {
            yield prisma_1.default.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                    productId
                }
            });
        }
        const updatedCart = yield prisma_1.default.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });
        res.status(200).json(updatedCart);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});
exports.removeFromCart = removeFromCart;
