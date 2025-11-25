const { Schema, model } = require('mongoose')

const serviceabilityLogSchema = new Schema(
  {
    platform: { type: String, required: true },
    locationInput: { type: String, required: true },
    locationLabel: { type: String, required: true },
    pincode: { type: String },
    city: { type: String },
    state: { type: String },
    reason: { type: String },
    meta: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
)

serviceabilityLogSchema.index({ platform: 1, pincode: 1, locationLabel: 1 })
serviceabilityLogSchema.index({ createdAt: -1 })

module.exports = model('ServiceabilityLog', serviceabilityLogSchema)
