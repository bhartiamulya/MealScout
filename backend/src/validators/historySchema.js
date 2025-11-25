const { z } = require('zod')

const lineItem = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  inStock: z.boolean().optional(),
  replacement: z.string().optional()
})

const discount = z.object({
  type: z.string().min(1),
  code: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().nonnegative()
})

const platformResult = z.object({
  platform: z.enum(['zomato', 'swiggy', 'blinkit', 'zepto']),
  subtotal: z.number().nonnegative(),
  lineItems: z.array(lineItem).default([]),
  discounts: z.array(discount).default([]),
  discountTotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  deliveryTime: z.string().min(2),
  link: z.string().url(),
  total: z.number().nonnegative()
})

module.exports = z.object({
  body: z.object({
    item: z.string().min(2),
    location: z.string().min(2),
    results: z.array(platformResult).min(1),
    bestPlatform: platformResult
  })
})
