const express = require("express");

const router = express.Router();

const aiController = require("../controllers/aiController");


// TRACK ACTIVITY
router.post("/track", aiController.trackActivity);


// GET RECOMMENDATIONS
router.get("/recommendations/:userId", aiController.getRecommendations);


module.exports = router;