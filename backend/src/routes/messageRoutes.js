const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

// Get chat history with a specific user
router.get("/:userId", authMiddleware.verifyToken, messageController.getChatHistory);

// Send a new message
router.post("/", authMiddleware.verifyToken, messageController.sendMessage);

module.exports = router;
