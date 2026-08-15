const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { sendMail } = require("../config/mail");

const createOrder = async (req, res) => {
    try {
        const { paymentMethod, shippingAddress, deliveryArea } = req.body;

        const db = getDB();

        const cartsCollection = db.collection("carts");
        const productsCollection = db.collection("products");
        const ordersCollection = db.collection("orders");

        const cart = await cartsCollection.aggregate([
            {
                $match: {
                    userId: new ObjectId(req.user.id),
                },
            },
            {
                $unwind: "$items",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            {
                $unwind: "$product",
            },
            {
                $project: {
                    productId: "$product._id",
                    title: "$product.title",
                    thumbnail: "$product.thumbnail",
                    price: "$product.price",
                    quantity: "$items.quantity",
                    size: "$items.size",
                    subtotal: {
                        $multiply: [
                            "$items.quantity",
                            "$product.price",
                        ],
                    },
                },
            },
        ]).toArray();

        if (!cart.length) {
            return res.status(400).send({
                message: "Cart is empty",
            });
        }

        for (const item of cart) {
            const product = await productsCollection.findOne({
                _id: item.productId,
            });

            if (!product) {
                return res.status(404).send({
                    message: `${item.title} not found`,
                });
            }

            if (
                product.stock === 0 ||
                product.availabilityStatus === "Out of Stock"
            ) {
                return res.status(400).send({
                    message: `${item.title} is out of stock`,
                });
            }

            if (item.quantity > product.stock) {
                return res.status(400).send({
                    message: `Only ${product.stock} ${item.title} available in stock`,
                });
            }
        }

        const totalItems = cart.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const totalPrice = cart.reduce(
            (sum, item) => sum + item.subtotal,
            0
        );

        const FREE_SHIPPING_THRESHOLD = 1000;
        const SHIPPING_INSIDE_DHAKA = 60;
        const SHIPPING_OUTSIDE_DHAKA = 120;

        const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;
        const shippingCost = isFreeShipping ? 0 : (deliveryArea === "inside_dhaka" ? SHIPPING_INSIDE_DHAKA : SHIPPING_OUTSIDE_DHAKA);
        const grandTotal = totalPrice + shippingCost;

        const order = {
            userId: new ObjectId(req.user.id),
            items: cart,
            totalItems,
            subtotal: totalPrice,
            shippingCost,
            deliveryArea,
            totalPrice: grandTotal,
            shippingAddress,
            paymentMethod,
            paymentStatus: "pending",
            orderStatus: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await ordersCollection.insertOne(order);

        await cartsCollection.deleteOne({
            userId: new ObjectId(req.user.id),
        });

        res.status(201).send({
            message: "Order placed successfully",
            insertedId: result.insertedId,
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error",
        });
    }
};

const createGuestOrder = async (req, res) => {
    try {
        const { items, paymentMethod, shippingAddress, deliveryArea } = req.body;

        const db = getDB();
        const productsCollection = db.collection("products");
        const ordersCollection = db.collection("orders");

        const cart = [];

        for (const item of items) {
            const product = await productsCollection.findOne({
                _id: new ObjectId(item.productId),
            });

            if (!product) {
                return res.status(404).send({
                    message: `Product not found`,
                });
            }

            if (product.stock === 0 || product.availabilityStatus === "Out of Stock") {
                return res.status(400).send({
                    message: `${product.title} is out of stock`,
                });
            }

            if (item.quantity > product.stock) {
                return res.status(400).send({
                    message: `Only ${product.stock} ${product.title} available in stock`,
                });
            }

            cart.push({
                productId: product._id,
                title: product.title,
                thumbnail: product.thumbnail,
                price: product.price,
                quantity: item.quantity,
                size: item.size || "",
                subtotal: item.quantity * product.price,
            });
        }

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.subtotal, 0);

        const FREE_SHIPPING_THRESHOLD = 1000;
        const SHIPPING_INSIDE_DHAKA = 60;
        const SHIPPING_OUTSIDE_DHAKA = 120;

        const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;
        const shippingCost = isFreeShipping ? 0 : (deliveryArea === "inside_dhaka" ? SHIPPING_INSIDE_DHAKA : SHIPPING_OUTSIDE_DHAKA);
        const grandTotal = totalPrice + shippingCost;

        const order = {
            userId: null,
            guestPhone: shippingAddress.phone,
            items: cart,
            totalItems,
            subtotal: totalPrice,
            shippingCost,
            deliveryArea,
            totalPrice: grandTotal,
            shippingAddress,
            paymentMethod,
            paymentStatus: "pending",
            orderStatus: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await ordersCollection.insertOne(order);

        res.status(201).send({
            message: "Order placed successfully",
            insertedId: result.insertedId,
            orderId: result.insertedId,
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error",
        });
    }
};

const trackOrder = async (req, res) => {
    try {
        const { orderId, phone } = req.body;

        if (!orderId && !phone) {
            return res.status(400).send({
                message: "Order ID or Phone Number is required",
            });
        }

        const db = getDB();
        const ordersCollection = db.collection("orders");

        let order = null;

        if (orderId) {
            // Try full ObjectId first
            try {
                order = await ordersCollection.findOne({
                    _id: new ObjectId(orderId),
                });
            } catch {
                // Not a valid ObjectId, try short ID match
            }

            // If not found, try matching by short ID (last 8 chars)
            if (!order && orderId.length <= 24) {
                const allOrders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();
                order = allOrders.find((o) => {
                    const shortId = o._id?.toString().slice(-8).toUpperCase();
                    return shortId === orderId.toUpperCase();
                });
            }

            if (!order) {
                return res.status(404).send({
                    message: "Order not found",
                });
            }

            if (order.guestPhone && phone && order.guestPhone !== phone) {
                return res.status(403).send({
                    message: "Phone number does not match",
                });
            }
        } else if (phone) {
            const orders = await ordersCollection
                .find({
                    $or: [
                        { guestPhone: phone },
                        { "shippingAddress.phone": phone },
                    ],
                })
                .sort({ createdAt: -1 })
                .toArray();

            if (!orders.length) {
                return res.status(404).send({
                    message: "Order not found",
                });
            }

            order = orders[0];
        }

        res.send(order);

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error",
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const db = getDB();

        const ordersCollection = db.collection("orders");

        const orders = await ordersCollection
            .find({
                userId: new ObjectId(req.user.id)
            })
            .sort({
                createdAt: -1
            })
            .toArray();

        res.send({
            totalOrders: orders.length,
            orders
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const db = getDB();
        const ordersCollection = db.collection("orders");

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || "";
        const skip = (page - 1) * limit;

        const query = {};
        if (status && status !== "all") {
            query.orderStatus = status;
        }

        const totalOrders = await ordersCollection.countDocuments(query);

        const orders = await ordersCollection
            .find(query)
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit)
            .toArray();

        res.send({
            totalOrders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            orders
        });

    } catch (error) {

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const db = getDB();
        const ordersCollection = db.collection("orders");

        const order = await ordersCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!order) {
            return res.status(404).send({
                message: "Order not found"
            });
        }

        const isOwner = order.userId && order.userId.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).send({
                message: "Forbidden"
            });
        }

        res.send(order);

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const validStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ];

        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).send({
                message: "Invalid order status",
            });
        }

        const db = getDB();

        const ordersCollection = db.collection("orders");
        const productsCollection = db.collection("products");

        const order = await ordersCollection.findOne({
            _id: new ObjectId(id),
        });

        if (!order) {
            return res.status(404).send({
                message: "Order not found",
            });
        }

        if (
            orderStatus === "delivered" &&
            order.orderStatus !== "delivered"
        ) {
            for (const item of order.items) {
                const product = await productsCollection.findOne({
                    _id: item.productId,
                });

                if (!product) {
                    return res.status(404).send({
                        message: `${item.title} not found`,
                    });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).send({
                        message: `${item.title} is out of stock`,
                    });
                }

                const newStock = product.stock - item.quantity;

                await productsCollection.updateOne(
                    {
                        _id: item.productId,
                    },
                    {
                        $set: {
                            stock: newStock,
                            availabilityStatus:
                                newStock > 0
                                    ? "In Stock"
                                    : "Out of Stock",
                        },
                    }
                );
            }
        }

        await ordersCollection.updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: {
                    orderStatus,
                    updatedAt: new Date(),
                },
            }
        );

        res.send({
            message: "Order status updated successfully",
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error",
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const db = getDB();
        const ordersCollection = db.collection("orders");

        const order = await ordersCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!order) {
            return res.status(404).send({
                message: "Order not found"
            });
        }

        const isOwner = order.userId && order.userId.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).send({
                message: "Forbidden"
            });
        }

        if (order.orderStatus !== "pending") {
            return res.status(400).send({
                message: "Only pending orders can be cancelled"
            });
        }

        await ordersCollection.updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: {
                    orderStatus: "cancelled",
                    updatedAt: new Date()
                }
            }
        );

        res.send({
            message: "Order cancelled successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const sendInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const db = getDB();
        const ordersCollection = db.collection("orders");

        let order;
        try {
            order = await ordersCollection.findOne({
                _id: new ObjectId(id),
            });
        } catch {
            return res.status(404).send({ message: "Order not found" });
        }

        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }

        const email = req.body?.email || order.shippingAddress?.email;
        if (!email) {
            return res.status(400).send({ message: "No email address found for this order" });
        }

        const orderShortId = order._id?.toString().slice(-8).toUpperCase();
        const itemsHtml = order.items
            .map(
                (item) => `
                <tr>
                    <td style="padding:10px;border-bottom:1px solid #eee;">${item.title}${item.size ? ` (Size: ${item.size})` : ""}</td>
                    <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
                    <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">৳${item.price}</td>
                    <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">৳${item.subtotal || item.price * item.quantity}</td>
                </tr>`
            )
            .join("");

        const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
            <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <div style="background:#1a1a1a;color:#fff;padding:24px 30px;">
                    <h1 style="margin:0;font-size:22px;">Zayan Classic</h1>
                    <p style="margin:4px 0 0;font-size:13px;opacity:0.8;">Order Invoice</p>
                </div>
                <div style="padding:30px;">
                    <p style="margin:0 0 4px;font-size:14px;color:#666;">Order ID</p>
                    <p style="margin:0 0 20px;font-size:18px;font-weight:bold;">#${orderShortId}</p>

                    <p style="margin:0 0 4px;font-size:14px;color:#666;">Date</p>
                    <p style="margin:0 0 20px;font-size:14px;">${new Date(order.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}</p>

                    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">

                    <h3 style="margin:0 0 10px;font-size:15px;">Items</h3>
                    <table style="width:100%;border-collapse:collapse;font-size:13px;">
                        <thead>
                            <tr style="background:#f9f9f9;">
                                <th style="padding:10px;text-align:left;">Product</th>
                                <th style="padding:10px;text-align:center;">Qty</th>
                                <th style="padding:10px;text-align:right;">Price</th>
                                <th style="padding:10px;text-align:right;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>

                    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">

                    <div style="font-size:14px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:#666;">Subtotal</span>
                            <span>৳${order.subtotal}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:#666;">Shipping (${order.deliveryArea === "inside_dhaka" ? "Dhaka" : "Outside Dhaka"})</span>
                            <span>${order.shippingCost > 0 ? "৳" + order.shippingCost : "Free"}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;border-top:2px solid #1a1a1a;padding-top:10px;margin-top:10px;">
                            <span>Total</span>
                            <span>৳${order.totalPrice}</span>
                        </div>
                    </div>

                    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">

                    <h3 style="margin:0 0 10px;font-size:15px;">Shipping Address</h3>
                    <p style="margin:0;font-size:13px;color:#444;line-height:1.6;">
                        ${order.shippingAddress?.fullName}<br>
                        ${order.shippingAddress?.phone}<br>
                        ${order.shippingAddress?.address}<br>
                        ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}
                    </p>

                    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">

                    <p style="margin:0;font-size:13px;color:#888;text-align:center;">
                        Payment Method: ${order.paymentMethod} | Status: ${order.paymentStatus}
                    </p>
                </div>
                <div style="background:#f9f9f9;padding:16px 30px;text-align:center;font-size:12px;color:#999;">
                    Thank you for shopping with Zayan Classic!
                </div>
            </div>
        </body>
        </html>`;

        await sendMail({
            to: email,
            subject: `Invoice - Order #${orderShortId} | Zayan Classic`,
            html,
        });

        res.send({ message: "Invoice sent successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to send invoice" });
    }
};

module.exports = {
    createOrder,
    createGuestOrder,
    trackOrder,
    getMyOrders,
    getAllOrders,
    getSingleOrder,
    updateOrderStatus,
    cancelOrder,
    sendInvoice,
};