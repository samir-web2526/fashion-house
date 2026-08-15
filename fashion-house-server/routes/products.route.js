const express = require("express");

const {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getFlashSaleProducts,
    getBestSellingProducts,
    getNewArrivals
} = require("../controllers/products.controller");

const validate = require("../middlewares/validate");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

const {
    createProductSchema,
    updateProductSchema
} = require("../validations/product.validation");

const router = express.Router();

router.get("/flash-sale", getFlashSaleProducts);

router.get("/best-sellers", getBestSellingProducts);

router.get("/new-arrivals", getNewArrivals);

router.post(
    "/",
    verifyToken,
    verifyAdmin,
    validate(createProductSchema),
    createProduct
);

router.get("/", getAllProducts);

router.get("/:id", getSingleProduct);

router.patch(
    "/:id",
    verifyToken,
    verifyAdmin,
    validate(updateProductSchema),
    updateProduct
);

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    deleteProduct
);

module.exports = router;