const mongoose = require('mongoose');
const env = require('../config/env');

function connectMongo() {
  return mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000
  });
}

module.exports = connectMongo;
