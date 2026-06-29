"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.userId,
                role: decoded.role,
            };
            next();
        }
        catch (error) {
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }
    else {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};
exports.protect = protect;
