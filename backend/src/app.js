const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


// health check (we’ll improve next)
const db = require('./config/db');

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const tenantRoutes = require('./routes/tenant.routes');
app.use('/api/tenants', tenantRoutes);

const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

const projectRoutes = require('./routes/project.routes');
app.use('/api/projects', projectRoutes);

const taskRoutes = require('./routes/task.routes');
app.use('/api', taskRoutes);

const errorMiddleware = require('./middleware/error.middleware');
app.use(errorMiddleware);

module.exports = app;
