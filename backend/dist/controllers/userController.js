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
exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "CUSTOMER"
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({
            message: 'User created successfully',
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
            token
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to login' });
    }
});
exports.loginUser = loginUser;
