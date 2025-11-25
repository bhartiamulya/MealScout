const { z } = require('zod')

module.exports = z.object({
  params: z.object({
    platform: z.enum(['zomato', 'swiggy', 'blinkit', 'zepto'])
  }),
  body: z.object({
    item: z.string().min(2),
    location: z.string().min(2)
  })
})
