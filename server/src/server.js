const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env.config');
const logger = require('./utils/logger');
const { connect } = require('./config/mongo.config');

async function start() {
  try {
    await connect();
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    logger.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

start();
