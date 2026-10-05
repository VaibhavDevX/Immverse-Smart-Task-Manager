import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Smart Task Manager Backend Server listening on http://localhost:${PORT}`);
  console.log(`📌 API base URL: http://localhost:${PORT}/api`);
  console.log(`ℹ️  Note: Data is held in-memory (Map storage) and resets upon server restart.`);
});
