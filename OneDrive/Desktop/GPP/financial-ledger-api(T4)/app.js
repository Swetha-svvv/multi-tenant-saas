const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

// routes (will add later)
const accountRoutes = require("./routes/accounts");
const transactionRoutes = require("./routes/transactions");

app.use("/accounts", accountRoutes);
app.use("/", transactionRoutes);

app.get("/", (req, res) => {
  res.send("Financial Ledger API is running");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
