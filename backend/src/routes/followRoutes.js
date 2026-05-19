const express = require("express");

const router = express.Router();

const followController = require("../controllers/followController");


// FOLLOW BUSINESS
router.post("/", followController.followBusiness);


// GET FEED
router.get("/feed/:userId", followController.getFeed);


module.exports = router;