const { z } = require('zod')

const itemSchema = z.string().min(2)

module.exports = z.object({
  body: z
    .object({
      item: itemSchema.optional(),
      items: z.array(itemSchema).min(1).optional(),
      location: z.string().min(2)
    })
    .refine((value) => value.item || (value.items && value.items.length > 0), {
      message: 'Provide at least one item',
      path: ['items']
    })
})
