const router = require('express').Router()
const controller = require('../controllers/compareController')
const validate = require('../middleware/validate')
const compareSchema = require('../validators/compareSchema')

router.post('/', validate(compareSchema), controller.compare)

module.exports = router
