const router = require('express').Router()
const controller = require('../controllers/historyController')
const validate = require('../middleware/validate')
const historySchema = require('../validators/historySchema')

router.get('/list', controller.list)
router.post('/save', validate(historySchema), controller.save)

module.exports = router
