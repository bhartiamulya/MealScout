const { Schema, model } = require('mongoose');

const lineItemSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
    replacement: { type: String }
  },
  { _id: false }
)

const discountSchema = new Schema(
  {
    type: { type: String, required: true },
    code: { type: String },
    description: { type: String },
    amount: { type: Number, required: true }
  },
  { _id: false }
)

const platformResultSchema = new Schema(
  {
    platform: { type: String, required: true },
    subtotal: { type: Number, required: true },
    lineItems: { type: [lineItemSchema], default: [] },
    discounts: { type: [discountSchema], default: [] },
    discountTotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, required: true },
    tax: { type: Number, required: true },
    deliveryTime: { type: String, required: true },
    link: { type: String, required: true },
    total: { type: Number, required: true },
    serviceable: { type: Boolean, default: true },
    unavailableReason: { type: String, default: null }
  },
  { _id: false }
)

const locationDetailsSchema = new Schema(
  {
    raw: { type: String },
    displayName: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    source: { type: String }
  },
  { _id: false }
)

const historySchema = new Schema(
  {
    item: { type: String, required: true },
    location: { type: String, required: true },
    locationDetails: { type: locationDetailsSchema, default: null },
    bestPlatform: { type: String, required: true },
    bestPlatformTotal: { type: Number, required: true },
    results: { type: [platformResultSchema], default: [] }
  },
  { timestamps: true }
)

historySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 })

module.exports = model('ResultHistory', historySchema)
