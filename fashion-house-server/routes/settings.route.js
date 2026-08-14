const express = require("express");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settings.controller");

const validate = require("../middlewares/validate");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

const {
  updateSettingsSchema,
} = require("../validations/settings.validation");

const router = express.Router();

router.get("/", getSettings);

router.patch(
  "/",
  verifyToken,
  verifyAdmin,
  validate(updateSettingsSchema),
  updateSettings
);

module.exports = router;
