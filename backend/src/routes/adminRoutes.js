const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

const adminOnly = [verifyToken, checkRole(['admin'])];

router.get("/stats", adminOnly, adminController.getStats);
router.get("/users", adminOnly, adminController.getAllUsers);
router.put("/users/:userId/toggle", adminOnly, adminController.toggleUserStatus);
router.put("/businesses/:businessId/verify", adminOnly, adminController.verifyBusiness);

module.exports = router;