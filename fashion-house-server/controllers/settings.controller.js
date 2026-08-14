const { getDB } = require("../config/db");

const getSettings = async (req, res) => {
  try {
    const db = getDB();
    const settingsCollection = db.collection("settings");

    const settings = await settingsCollection.findOne({});

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { siteName, logo, contactEmail, contactPhone, address, googleMapLink } = req.body;

    const updateData = {};

    if (siteName !== undefined) updateData.siteName = siteName;
    if (logo !== undefined) updateData.logo = logo;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (address !== undefined) updateData.address = address;
    if (googleMapLink !== undefined) updateData.googleMapLink = googleMapLink;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data to update" });
    }

    const db = getDB();
    const settingsCollection = db.collection("settings");

    await settingsCollection.updateOne(
      {},
      { $set: updateData },
      { upsert: true }
    );

    const updatedSettings = await settingsCollection.findOne({});

    res.status(200).json({
      message: "Settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
