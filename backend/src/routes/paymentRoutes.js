const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, paymentController.createPayment);
router.put("/:paymentId/status", verifyToken, paymentController.updatePaymentStatus);
router.get("/order/:orderId", verifyToken, paymentController.getPaymentByOrder);

module.exports = router;