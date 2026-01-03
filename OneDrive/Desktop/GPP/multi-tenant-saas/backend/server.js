const express = require("express");
const cors = require("cors");
require("dotenv").config();

// DB
const db = require("./src/config/db");

// Routes
const authRoutes = require("./src/routes/auth.routes");
const tenantRoutes = require("./src/routes/tenant.routes");
const userRoutes = require("./src/routes/user.routes");
const projectRoutes = require("./src/routes/project.routes");
const taskRoutes = require("./src/routes/task.routes");

// Migrations & Seeds
const runMigrations = require("./database/migrations/runMigrations");
const runSeeds = require("./database/migrations/runSeeds");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

/* -------------------- HEALTH CHECK -------------------- */
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", taskRoutes);

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log("⏳ Running database migrations...");
    await runMigrations();

    console.log("🌱 Loading seed data...");
    await runSeeds();

    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize database", error);
    process.exit(1);
  }
})();
