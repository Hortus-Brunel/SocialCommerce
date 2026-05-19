const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// Public
router.get("/", businessController.getBusinesses);

// Protected
router.get("/owner/:ownerId", verifyToken, businessController.getBusinessByOwner);
router.get("/stats/:businessId", verifyToken, businessController.getBusinessStats);
router.post("/", verifyToken, checkRole(["business"]), businessController.createBusiness);

module.exports = router;