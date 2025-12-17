const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

/**
 * 🔹 Helper: Get current balance of an account
 */
async function getBalance(client, accountId) {
  const result = await client.query(
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

  return Number(result.rows[0].balance);
}

/**
 * 🔹 DEPOSIT
 */
async function deposit({ account_id, amount, currency, description }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const transactionId = uuidv4();

    // 1️⃣ Transaction record
    await client.query(
      `
      INSERT INTO transactions
      (id, type, destination_account_id, amount, currency, status, description)
      VALUES ($1, 'deposit', $2, $3, $4, 'completed', $5)
      `,
      [transactionId, account_id, amount, currency, description]
    );

    // 2️⃣ Ledger entry (CREDIT)
    await client.query(
      `
      INSERT INTO ledger_entries
      (id, account_id, transaction_id, entry_type, amount)
      VALUES ($1, $2, $3, 'credit', $4)
      `,
      [uuidv4(), account_id, transactionId, amount]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 🔹 WITHDRAWAL (PREVENT NEGATIVE BALANCE)
 */
async function withdraw({ account_id, amount, currency, description }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const balance = await getBalance(client, account_id);

    if (balance < amount) {
      throw new Error("Insufficient balance");
    }

    const transactionId = uuidv4();

    // 1️⃣ Transaction record
    await client.query(
      `
      INSERT INTO transactions
      (id, type, source_account_id, amount, currency, status, description)
      VALUES ($1, 'withdrawal', $2, $3, $4, 'completed', $5)
      `,
      [transactionId, account_id, amount, currency, description]
    );

    // 2️⃣ Ledger entry (DEBIT)
    await client.query(
      `
      INSERT INTO ledger_entries
      (id, account_id, transaction_id, entry_type, amount)
      VALUES ($1, $2, $3, 'debit', $4)
      `,
      [uuidv4(), account_id, transactionId, amount]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 🔹 TRANSFER (DOUBLE-ENTRY: DEBIT + CREDIT)
 */
async function transfer({
  source_account_id,
  destination_account_id,
  amount,
  currency,
  description,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Check balance of source account
    const balance = await getBalance(client, source_account_id);
    if (balance < amount) {
      throw new Error("Insufficient balance in source account");
    }

    const transactionId = uuidv4();

    // 2️⃣ Transaction record
    await client.query(
      `
      INSERT INTO transactions
      (id, type, source_account_id, destination_account_id, amount, currency, status, description)
      VALUES ($1, 'transfer', $2, $3, $4, $5, 'completed', $6)
      `,
      [
        transactionId,
        source_account_id,
        destination_account_id,
        amount,
        currency,
        description,
      ]
    );

    // 3️⃣ Ledger entry → DEBIT source
    await client.query(
      `
      INSERT INTO ledger_entries
      (id, account_id, transaction_id, entry_type, amount)
      VALUES ($1, $2, $3, 'debit', $4)
      `,
      [uuidv4(), source_account_id, transactionId, amount]
    );

    // 4️⃣ Ledger entry → CREDIT destination
    await client.query(
      `
      INSERT INTO ledger_entries
      (id, account_id, transaction_id, entry_type, amount)
      VALUES ($1, $2, $3, 'credit', $4)
      `,
      [uuidv4(), destination_account_id, transactionId, amount]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  deposit,
  withdraw,
  transfer,
};
