const express = require("express");

const {
    addToCart,
    getCart,
    updateCart,
    removeFromCart
} = require("../controllers/cart.controller");

const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

router.post(
    "/",
    verifyToken,
    addToCart
);

router.get(
    "/",
    verifyToken,
    getCart
);

router.patch(
    "/:productId",
    verifyToken,
    updateCart
);

router.delete(
    "/:productId",
    verifyToken,
    removeFromCart
);

module.exports = router;