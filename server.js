import { config } from './src/config/env.js';
import app from './api/index.js';

const PORT = config.port;
console.log(`Starting PValult API on port ${PORT}...`);

app.listen(PORT, 'localhost', () => {
  console.log(`PValult API running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});