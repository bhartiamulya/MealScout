const router = require('express').Router()
const controller = require('../controllers/fetchController')
const validate = require('../middleware/validate')
const fetchSchema = require('../validators/fetchSchema')

router.post('/:platform', validate(fetchSchema), controller.fetch)

module.exports = router
