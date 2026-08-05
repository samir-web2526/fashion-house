const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const createCategory = async (req, res) => {
    try {
        const db = getDB();
        const categoriesCollection = db.collection("categories");

        const category = {
            name: req.body.name.trim(),
            slug: req.body.slug.trim(),
            image: req.body.image || "",
            children: req.body.children || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await categoriesCollection.insertOne(category);

        res.status(201).send({
            message: "Category created successfully",
            insertedId: result.insertedId
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const db = getDB();
        const categoriesCollection = db.collection("categories");

        const categories = await categoriesCollection.find({}).toArray();

        res.send(categories);

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getSingleCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid category id"
            });
        }

        const db = getDB();
        const categoriesCollection = db.collection("categories");

        const category = await categoriesCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!category) {
            return res.status(404).send({
                message: "Category not found"
            });
        }

        res.send(category);

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid category id"
            });
        }

        const db = getDB();
        const categoriesCollection = db.collection("categories");

        const result = await categoriesCollection.updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: {
                    ...req.body,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({
                message: "Category not found"
            });
        }

        res.send({
            message: "Category updated successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid category id"
            });
        }

        const db = getDB();
        const categoriesCollection = db.collection("categories");

        const result = await categoriesCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).send({
                message: "Category not found"
            });
        }

        res.send({
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory
};