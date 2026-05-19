const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const authMiddleware = require("../middleware/authMiddleware");

// Upload middleware is handled in the controller
router.post("/upload", authMiddleware.verifyToken, mediaController.uploadMiddleware, mediaController.addMedia);

// Get media for a specific business
router.get("/business/:businessId", mediaController.getBusinessMedia);

module.exports = router;