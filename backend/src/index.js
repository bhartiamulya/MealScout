require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const app = require('./app');
const env = require('./config/env');
const connectMongo = require('./db/connection');

async function start() {
  try {
    await connectMongo();
    app.listen(env.port, () => {
      process.stdout.write(`Backend running on ${env.port}\n`);
    });
  } catch (error) {
    process.stderr.write(`Startup failed: ${error.message}\n`);
    process.exit(1);
  }
}

start();
