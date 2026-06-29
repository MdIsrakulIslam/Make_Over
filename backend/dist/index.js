"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/products', productRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/cart', cartRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Cosmetics E-commerce API is running');
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
// Force event loop to stay alive
setInterval(() => { }, 1000 * 60 * 60);
