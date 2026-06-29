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
exports.updateProduct = exports.getAllReviews = exports.createProductReview = exports.deleteProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield prisma_1.default.product.findMany({
            include: {
                category: true,
                reviews: true
            }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
exports.getProducts = getProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const product = yield prisma_1.default.product.findUnique({
            where: { id },
            include: {
                category: true,
                reviews: {
                    include: { user: true }
                }
            }
        });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});
exports.getProductById = getProductById;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, stock, imageUrl, categoryId } = req.body;
        // Upsert the category if it doesn't exist by name (mock MVP passed name as categoryId)
        const categoryName = categoryId || "Uncategorized";
        const category = yield prisma_1.default.category.upsert({
            where: { name: categoryName },
            update: {},
            create: { name: categoryName }
        });
        const newProduct = yield prisma_1.default.product.create({
            data: {
                name,
                description,
                price: Number(price),
                stock: Number(stock),
                imageUrl: imageUrl || "/product.png",
                categoryId: category.id
            },
            include: { category: true, reviews: true }
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});
exports.createProduct = createProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield prisma_1.default.product.delete({ where: { id } });
        res.status(200).json({ message: "Product deleted" });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
exports.deleteProduct = deleteProduct;
const createProductReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { rating, comment, userId } = req.body; // Expecting userId now instead of just userName for real auth
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const newReview = yield prisma_1.default.review.create({
            data: {
                rating: Number(rating),
                comment,
                productId: id,
                userId: userId
            },
            include: { user: true }
        });
        res.status(201).json({ message: "Review added successfully", review: newReview });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add review' });
    }
});
exports.createProductReview = createProductReview;
const getAllReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allReviews = yield prisma_1.default.review.findMany({
            include: {
                product: true,
                user: true
            },
            orderBy: { createdAt: 'desc' }
        });
        // Map to match frontend expectations if necessary
        const formattedReviews = allReviews.map((r) => (Object.assign(Object.assign({}, r), { productName: r.product.name, userName: r.user.name, date: r.createdAt })));
        res.json(formattedReviews);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});
exports.getAllReviews = getAllReviews;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { name, description, price, stock, imageUrl, categoryId } = req.body;
        let categoryUpdate = {};
        if (categoryId) {
            const category = yield prisma_1.default.category.upsert({
                where: { name: categoryId },
                update: {},
                create: { name: categoryId }
            });
            categoryUpdate = { categoryId: category.id };
        }
        const updatedProduct = yield prisma_1.default.product.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (description && { description })), (price !== undefined && { price: Number(price) })), (stock !== undefined && { stock: Number(stock) })), (imageUrl && { imageUrl })), categoryUpdate),
            include: { category: true, reviews: true }
        });
        res.json(updatedProduct);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});
exports.updateProduct = updateProduct;
