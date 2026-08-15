
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const createProduct = async (req, res) => {
    try {
        const db = getDB();
        const productsCollection = db.collection("products");

        const {
            title,
            description,
            category,
            price,
            discountPercentage,
            stock,
            tags,
            brand,
            weight,
            dimensions,
            warrantyInformation,
            shippingInformation,
            returnPolicy,
            minimumOrderQuantity,
            sizes,
            sizeMeasurements,
            images,
            thumbnail
        } = req.body;

        const normalizedPrice = Number(price ?? 0);
        const normalizedDiscountPercentage = Number(discountPercentage ?? 0);
        const normalizedStock = Number(stock ?? 0);
        const normalizedMinimumOrderQuantity = Number(minimumOrderQuantity ?? 1);

        const newProduct = {
            title,
            description,
            category,
            price: normalizedPrice,
            discountPercentage: normalizedDiscountPercentage,
            rating: 0,
            stock: normalizedStock,
            tags,
            brand,
            sku: `SKU-${Date.now()}`,
            weight: Number(weight ?? 0),

            dimensions: {
                width: dimensions?.width || null,
                height: dimensions?.height || null,
                depth: dimensions?.depth || null
            },

            warrantyInformation,
            shippingInformation,

            availabilityStatus: normalizedStock > 0
                ? "In Stock"
                : "Out of Stock",

            reviews: [],

            returnPolicy,
            minimumOrderQuantity: normalizedMinimumOrderQuantity,
            sizes: sizes || [],
            sizeMeasurements: sizeMeasurements || [],

            meta: {
                createdAt: new Date(),
                updatedAt: new Date(),
                barcode: "",
                qrCode: ""
            },

            images,
            thumbnail
        };

        const result = await productsCollection.insertOne(newProduct);

        res.status(201).send({
            message: "Product created successfully",
            insertedId: result.insertedId
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getAllProducts = async (req, res) => {

    try {
        const db = getDB();
        const productsCollection = db.collection("products");

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const search = req.query.search || "";
        const category = req.query.category || "";
        const brand = req.query.brand || "";
        const sort = req.query.sort || "";

        const skip = (page - 1) * limit;

        const query = {};

        if (search) {
            query.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    brand: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        if (category) {
            query.category = category;
        }

        if (brand) {
            query.brand = brand;
        }

        let sortOption = { "meta.createdAt": -1 };

        if (sort === "asc") {
            sortOption = { price: 1 };
        } else if (sort === "desc") {
            sortOption = { price: -1 };
        }

        const totalProducts = await productsCollection.countDocuments(query);

        const products = await productsCollection
            .find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .toArray();

        res.send({
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            products,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getSingleProduct = async (req, res) => {

    try {
        const { id } = req.params;

           if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid product id"
            });
        }

        const db = getDB();

        const productsCollection = db.collection("products");

        const query = { _id: new ObjectId(id) };

        const result = await productsCollection.findOne(query);

        if (!result) {
            return res.status(404).send({ message: "Product not found" });
        }

        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const db = getDB();

        const productsCollection = db.collection("products");

        const updatedFields = {
            ...req.body,
            ...(req.body.price !== undefined && { price: Number(req.body.price) }),
            ...(req.body.discountPercentage !== undefined && { discountPercentage: Number(req.body.discountPercentage) }),
            ...(req.body.stock !== undefined && { stock: Number(req.body.stock) }),
            ...(req.body.weight !== undefined && { weight: Number(req.body.weight) }),
            ...(req.body.minimumOrderQuantity !== undefined && { minimumOrderQuantity: Number(req.body.minimumOrderQuantity) }),
            "meta.updatedAt": new Date()
        };

        const result = await productsCollection.updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: updatedFields
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({
                message: "Product not found"
            });
        }

        res.send({
            message: "Product updated successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const db = getDB();
        const productsCollection = db.collection("products");

        const result = await productsCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).send({
                message: "Product not found"
            });
        }

        res.send({
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getFlashSaleProducts = async (req, res) => {
    try {
        const db = getDB();
        const productsCollection = db.collection("products");

        const products = await productsCollection
            .aggregate([
                {
                    $match: {
                        discountPercentage: { $gt: 60 },
                        stock: { $gt: 0 }
                    }
                },
                {
                    $sort: {
                        discountPercentage: -1,
                        stock: -1
                    }
                },
                {
                    $limit: 8
                }
            ])
            .toArray();

        const maxStockResult = await productsCollection
            .aggregate([
                {
                    $match: {
                        discountPercentage: { $gt: 60 },
                        stock: { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        maxStock: { $max: "$stock" }
                    }
                }
            ])
            .toArray();

        const maxStock = maxStockResult.length > 0 ? maxStockResult[0].maxStock : 1;

        res.send({ products, maxStock });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getBestSellingProducts = async (req, res) => {
    try {
        const db = getDB();
        const productsCollection = db.collection("products");
        const ordersCollection = db.collection("orders");

        const products = await ordersCollection
            .aggregate([
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.productId",
                        totalSold: { $sum: "$items.quantity" }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 8 },
                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                { $unwind: "$product" },
                {
                    $replaceRoot: {
                        newRoot: {
                            $mergeObjects: ["$product", { totalSold: "$totalSold" }]
                        }
                    }
                }
            ])
            .toArray();

        const maxSold = products.length > 0
            ? Math.max(...products.map(p => p.totalSold ?? 0))
            : 0;
        const maxRating = products.length > 0
            ? Math.max(...products.map(p => p.rating ?? 0))
            : 0;

        const result = products.map(product => {
            let badge = null;
            if ((product.totalSold ?? 0) === maxSold && maxSold > 0) {
                badge = "best-seller";
            } else if ((product.rating ?? 0) === maxRating && maxRating > 0) {
                badge = "top-rated";
            }
            return { ...product, badge };
        });

        res.send({ products: result });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getNewArrivals = async (req, res) => {
    try {
        const db = getDB();
        const productsCollection = db.collection("products");

        const products = await productsCollection
            .aggregate([
                {
                    $sort: {
                        "meta.createdAt": -1,
                        rating: -1,
                        discountPercentage: -1
                    }
                },
                {
                    $limit: 12
                }
            ])
            .toArray();

        res.send({ products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getFlashSaleProducts,
    getBestSellingProducts,
    getNewArrivals
};