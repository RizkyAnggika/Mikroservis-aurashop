const express = require("express");
const router = express.Router();
const transactionsCon = require("../controllers/transactionsCon");

router.get("/", transactionsCon.getAllTransactions);
router.post("/", transactionsCon.addTransaction);

module.exports = router;
