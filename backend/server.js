const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./src/config/db");

// Routes
const authRoutes = require("./src/routes/auth.routes");
const tenantRoutes = require("./src/routes/tenant.routes");
const userRoutes = require("./src/routes/user.routes");
const projectRoutes = require("./src/routes/project.routes");
const taskRoutes = require("./src/routes/task.routes");

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
app.use('/api/users', require('./src/routes/user.routes'));

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

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
