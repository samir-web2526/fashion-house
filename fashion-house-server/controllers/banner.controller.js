const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { withCache, clearCache } = require("../utils/cache");

const createBanner = async (req, res) => {
    try {
        const db = getDB();
        const bannersCollection = db.collection("banners");

        const { title, image, link, isActive } = req.body;

        const newBanner = {
            title,
            image,
            link,
            isActive,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await bannersCollection.insertOne(newBanner);

        clearCache();

        res.status(201).send({
            message: "Banner created successfully",
            insertedId: result.insertedId
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getAllBanners = async (req, res) => {
    try {
        const banners = await withCache("banners", 300, async () => {
            const db = getDB();
            const bannersCollection = db.collection("banners");
            return await bannersCollection.find({}).sort({ createdAt: -1 }).toArray();
        });
        res.send(banners);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getSingleBanner = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid banner id" });
        }
        const db = getDB();
        const bannersCollection = db.collection("banners");
        const banner = await bannersCollection.findOne({ _id: new ObjectId(id) });
        if (!banner) {
            return res.status(404).send({ message: "Banner not found" });
        }
        res.send(banner);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid banner id" });
        }
        const db = getDB();
        const bannersCollection = db.collection("banners");
        const result = await bannersCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...req.body, updatedAt: new Date() } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).send({ message: "Banner not found" });
        }
        clearCache();
        res.send({ message: "Banner updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid banner id" });
        }
        const db = getDB();
        const bannersCollection = db.collection("banners");
        const result = await bannersCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Banner not found" });
        }
        clearCache();
        res.send({ message: "Banner deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports = {
    createBanner, getAllBanners, getSingleBanner, updateBanner, deleteBanner
};
