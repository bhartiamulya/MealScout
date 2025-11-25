const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const compareRouter = require('./routes/compare');
const fetchRouter = require('./routes/fetch');
const historyRouter = require('./routes/history');
const analyticsRouter = require('./routes/analytics');
const healthRouter = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const logger = pinoHttp();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/compare', compareRouter);
app.use('/fetch', fetchRouter);
app.use('/history', historyRouter);
app.use('/analytics', analyticsRouter);
app.use('/health', healthRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
