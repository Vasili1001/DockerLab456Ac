require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { initializeSocket } = require('./socket');
const tasksRouter = require('./routes/tasks');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

initializeSocket(server);

(async function ensureTasksTable() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "tasks" ensured/created.');
  } catch (err) {
    console.error('❌ Could not create table "tasks":', err);
  }
})();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/tasks', tasksRouter);

app.get('/', (req, res) => {
  res.send('🚀 ToDo Backend with WebSocket is running...');
});

process.on('SIGINT', async () => {
  console.log('🛑 Graceful shutdown...');
  await db.end();
  process.exit();
});

server.listen(PORT, () => {
  console.log(`🚀 Backend + WS on port ${PORT}`);
});
