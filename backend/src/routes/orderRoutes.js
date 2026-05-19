const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, orderController.createOrder);
router.get("/user/:userId", verifyToken, orderController.getUserOrders);
router.get("/business/:businessId", verifyToken, orderController.getBusinessOrders);
router.get("/:id", verifyToken, orderController.getOrderById);
router.put("/:id/status", verifyToken, orderController.updateOrderStatus);

module.exports = router;