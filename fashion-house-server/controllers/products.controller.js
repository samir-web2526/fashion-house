const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { withCache, clearCache } = require("../utils/cache");
const { buildIdQuery } = require("../utils/buildIdQuery");

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
            colors,
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
            colors: colors || [],

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
        clearCache();

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

        const page = req.query.page ? parseInt(req.query.page) : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;

        const search = req.query.search || "";
        const category = req.query.category || "";
        const brand = req.query.brand || "";
        const sort = req.query.sort || "";

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
            const categoriesArray = category.split(",");
            if (categoriesArray.length > 1) {
                query.category = { $in: categoriesArray };
            } else {
                query.category = category;
            }
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

        const cacheKey = `products_${page}_${limit}_${search}_${category}_${brand}_${sort}`;
        const result = await withCache(cacheKey, 15, async () => {
            if (page && limit) {
                const skip = (page - 1) * limit;
                const totalProducts = Object.keys(query).length === 0 
                    ? await productsCollection.estimatedDocumentCount()
                    : await productsCollection.countDocuments(query);

                const products = await productsCollection
                    .find(query)
                    .project({ 
                        description: 0, 
                        dimensions: 0, 
                        reviews: 0, 
                        images: 0, 
                        sizeMeasurements: 0, 
                        warrantyInformation: 0, 
                        shippingInformation: 0, 
                        returnPolicy: 0, 
                        sizes: 0,
                        tags: 0,
                        sku: 0,
                        weight: 0,
                        availabilityStatus: 0,
                        minimumOrderQuantity: 0
                    })
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limit)
                    .toArray();

                return {
                    totalProducts,
                    currentPage: page,
                    totalPages: Math.ceil(totalProducts / limit),
                    products,
                };
            } else {
                const products = await productsCollection
                    .find(query)
                    .project({ 
                        description: 0, 
                        dimensions: 0, 
                        reviews: 0, 
                        images: 0, 
                        sizeMeasurements: 0, 
                        warrantyInformation: 0, 
                        shippingInformation: 0, 
                        returnPolicy: 0, 
                        sizes: 0,
                        tags: 0,
                        sku: 0,
                        weight: 0,
                        availabilityStatus: 0,
                        minimumOrderQuantity: 0
                    })
                    .sort(sortOption)
                    .toArray();

                return {
                    totalProducts: products.length,
                    products,
                };
            }
        });

        res.send(result);

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const productsCollection = db.collection("products");

        const result = await productsCollection.findOne(buildIdQuery(id));

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
            buildIdQuery(id),
            { $set: updatedFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: "Product not found" });
        }

        clearCache();
        res.send({ message: "Product updated successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const productsCollection = db.collection("products");

        const result = await productsCollection.deleteOne(buildIdQuery(id));

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Product not found" });
        }

        clearCache();
        res.send({ message: "Product deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getFlashSaleProducts = async (req, res) => {
    try {
        const { products, maxStock } = await withCache("flashSaleProducts", 10, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            const products = await productsCollection
                .aggregate([
                    {
                        $match: {
                            discountPercentage: { $gte: 50 },
                            stock: { $gt: 0 }
                        }
                    },
                    {
                        $project: {
                            description: 0,
                            dimensions: 0,
                            reviews: 0,
                            images: 0,
                            sizeMeasurements: 0,
                            warrantyInformation: 0,
                            shippingInformation: 0,
                            returnPolicy: 0,
                            sizes: 0,
                            meta: 0,
                            tags: 0,
                            sku: 0,
                            weight: 0,
                            availabilityStatus: 0,
                            minimumOrderQuantity: 0
                        }
                    },
                    {
                        $sort: {
                            discountPercentage: -1
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
                            discountPercentage: { $gte: 50 },
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
            return { products, maxStock };
        });

        res.send({ products, maxStock });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getBestSellingProducts = async (req, res) => {
    try {
        const result = await withCache("bestSellingProducts", 15, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");
            const ordersCollection = db.collection("orders");

            let products = await ordersCollection
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
                    },
                    {
                        $project: {
                            description: 0,
                            dimensions: 0,
                            reviews: 0,
                            images: 0,
                            sizeMeasurements: 0,
                            warrantyInformation: 0,
                            shippingInformation: 0,
                            returnPolicy: 0,
                            sizes: 0,
                            meta: 0,
                            tags: 0,
                            sku: 0,
                            weight: 0,
                            availabilityStatus: 0,
                            minimumOrderQuantity: 0
                        }
                    }
                ])
                .toArray();

            // Fallback: If there are no orders or less than 8 sold products, fill up with top-rated products
            if (products.length < 8) {
                const existingProductIds = products.map(p => p._id.toString());
                const limitNeeded = 8 - products.length;
                const fallbackProducts = await productsCollection
                    .find({ 
                        _id: { 
                            $nin: existingProductIds.map(id => {
                                try { return new ObjectId(id); } catch { return id; }
                            }) 
                        } 
                    })
                    .sort({ rating: -1 })
                    .limit(limitNeeded)
                    .project({
                        description: 0,
                        dimensions: 0,
                        reviews: 0,
                        images: 0,
                        sizeMeasurements: 0,
                        warrantyInformation: 0,
                        shippingInformation: 0,
                        returnPolicy: 0,
                        sizes: 0,
                        meta: 0,
                        tags: 0,
                        sku: 0,
                        weight: 0,
                        availabilityStatus: 0,
                        minimumOrderQuantity: 0
                    })
                    .toArray();

                products = [
                    ...products,
                    ...fallbackProducts.map(p => ({ ...p, totalSold: 0 }))
                ];
            }

            const maxSold = products.length > 0
                ? Math.max(...products.map(p => p.totalSold ?? 0))
                : 0;
            const maxRating = products.length > 0
                ? Math.max(...products.map(p => p.rating ?? 0))
                : 0;

            return products.map(product => {
                let badge = null;
                if ((product.totalSold ?? 0) === maxSold && maxSold > 0) {
                    badge = "best-seller";
                } else if ((product.rating ?? 0) === maxRating && maxRating > 0) {
                    badge = "top-rated";
                }
                return { ...product, badge };
            });
        });

        res.send({ products: result });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getNewArrivals = async (req, res) => {
    try {
        const products = await withCache("newArrivals", 15, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            return await productsCollection
                .find({})
                .project({
                    description: 0,
                    dimensions: 0,
                    reviews: 0,
                    images: 0,
                    sizeMeasurements: 0,
                    warrantyInformation: 0,
                    shippingInformation: 0,
                    returnPolicy: 0,
                    sizes: 0,
                    meta: 0,
                    tags: 0,
                    sku: 0,
                    weight: 0,
                    availabilityStatus: 0,
                    minimumOrderQuantity: 0
                })
                .sort({
                    _id: -1
                })
                .limit(12)
                .toArray();
        });

        res.send({ products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getLatestReviews = async (req, res) => {
    try {
        const reviews = await withCache("latestReviews", 15, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            // We only look at products that have reviews to reduce the pipeline size
            return await productsCollection.aggregate([
                { $match: { "reviews.0": { $exists: true } } },
                { $unwind: "$reviews" },
                { $replaceRoot: { newRoot: { $mergeObjects: ["$reviews", { productName: "$title" }] } } },
                { $sort: { date: -1 } },
                { $limit: 10 }
            ]).toArray();
        });

        res.send({ reviews });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getFeaturedProducts = async (req, res) => {
    try {
        const products = await withCache("featuredProducts", 15, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            return await productsCollection
                .find({})
                .project({
                    description: 0,
                    dimensions: 0,
                    reviews: 0,
                    images: 0,
                    sizeMeasurements: 0,
                    warrantyInformation: 0,
                    shippingInformation: 0,
                    returnPolicy: 0,
                    sizes: 0,
                    meta: 0,
                    tags: 0,
                    sku: 0,
                    weight: 0,
                    availabilityStatus: 0,
                    minimumOrderQuantity: 0
                })
                .sort({ rating: -1 })
                .limit(20)
                .toArray();
        });

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
    getNewArrivals,
    getLatestReviews,
    getFeaturedProducts
};