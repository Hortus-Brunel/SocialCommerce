const express = require("express");

const router = express.Router();

const socialController = require("../controllers/socialController");


// LIKE PRODUCT
router.post("/like", socialController.likeProduct);


// COMMENT PRODUCT
router.post("/comment", socialController.commentProduct);


// GET PRODUCT COMMENTS
router.get("/comments/:productId", socialController.getProductComments);


module.exports = router;