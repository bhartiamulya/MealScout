const { Schema, model } = require('mongoose');

const querySchema = new Schema(
  {
    item: { type: String, required: true },
    location: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = model('Query', querySchema);
