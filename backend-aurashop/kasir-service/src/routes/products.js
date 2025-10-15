const express = require("express");
const router = express.Router();
const productCon = require("../controllers/productCon");

router.get("/", productCon.getAllProducts);

module.exports = router;
