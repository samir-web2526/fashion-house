const express = require("express");

const {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/products.controller");

const validate = require("../middlewares/validate");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

const {
    createProductSchema,
    updateProductSchema
} = require("../validations/product.validation");

const router = express.Router();

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