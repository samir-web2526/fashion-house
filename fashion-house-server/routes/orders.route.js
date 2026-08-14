const express = require("express");

const {
    createOrder,
    createGuestOrder,
    getMyOrders,
    getAllOrders,
    getSingleOrder,
    trackOrder,
    updateOrderStatus,
    cancelOrder,
    sendInvoice,
} = require("../controllers/orders.controller");

const validate = require("../middlewares/validate");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

const {
    createOrderSchema,
    createGuestOrderSchema,
    updateOrderStatusSchema
} = require("../validations/orders.validation");

const router = express.Router();

router.post(
    "/",
    verifyToken,
    validate(createOrderSchema),
    createOrder
);

router.post(
    "/guest",
    validate(createGuestOrderSchema),
    createGuestOrder
);

router.post(
    "/track",
    trackOrder
);

router.post(
    "/:id/invoice",
    sendInvoice
);

router.get(
    "/",
    verifyToken,
    getMyOrders
);

router.get(
    "/all",
    verifyToken,
    verifyAdmin,
    getAllOrders
);

router.get(
    "/:id",
    verifyToken,
    getSingleOrder
);

router.patch(
    "/:id/status",
    verifyToken,
    verifyAdmin,
    validate(updateOrderStatusSchema),
    updateOrderStatus
);

router.patch(
    "/:id/cancel",
    verifyToken,
    cancelOrder
);

module.exports = router;