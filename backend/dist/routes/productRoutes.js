"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
router.get('/', productController_1.getProducts);
router.get('/reviews', productController_1.getAllReviews); // MUST BE BEFORE /:id to avoid matching id="reviews"
router.get('/:id', productController_1.getProductById);
router.post('/', productController_1.createProduct);
router.put('/:id', productController_1.updateProduct);
router.delete('/:id', productController_1.deleteProduct);
router.post('/:id/reviews', productController_1.createProductReview);
exports.default = router;
