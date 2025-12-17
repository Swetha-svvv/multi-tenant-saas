const express = require("express");
const router = express.Router();
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// CREATE ACCOUNT
router.post("/", async (req, res) => {
  try {
    const { user_id, account_type, currency, status } = req.body;
    const accountId = uuidv4();

    await pool.query(
      `
      INSERT INTO accounts (id, user_id, account_type, currency, status)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [accountId, user_id, account_type, currency, status]
    );

    res.status(201).json({
      message: "Account created",
      account_id: accountId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// GET ACCOUNT + BALANCE
router.get("/:id", async (req, res) => {
  try {
    const accountId = req.params.id.trim();

    const accountResult = await pool.query(
      "SELECT * FROM accounts WHERE id = $1",
      [accountId]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    const balanceResult = await pool.query(
      `
      SELECT COALESCE(
        SUM(
          CASE
            WHEN entry_type = 'credit' THEN amount
            WHEN entry_type = 'debit' THEN -amount
          END
        ), 0
      ) AS balance
      FROM ledger_entries
      WHERE account_id = $1
      `,
      [accountId]
    );

    res.json({
      account: accountResult.rows[0],
      balance: Number(balanceResult.rows[0].balance),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET LEDGER
router.get("/:id/ledger", async (req, res) => {
  try {
    const accountId = req.params.id.trim();

    const result = await pool.query(
      `
      SELECT id, transaction_id, entry_type, amount, created_at
      FROM ledger_entries
      WHERE account_id = $1
      ORDER BY created_at ASC
      `,
      [accountId]
    );

    res.json({
      account_id: accountId,
      entries: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// LIST ALL ACCOUNTS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM accounts");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
