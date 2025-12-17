const express = require("express");
const router = express.Router();
const { deposit, withdraw, transfer } = require("../services/ledgerService");

router.post("/deposits", async (req, res) => {
  try {
    await deposit(req.body);
    res.status(201).json({ message: "Deposit successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/withdrawals", async (req, res) => {
  try {
    await withdraw(req.body);
    res.status(201).json({ message: "Withdrawal successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/transfers", async (req, res) => {
  try {
    await transfer(req.body);
    res.status(201).json({ message: "Transfer successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
