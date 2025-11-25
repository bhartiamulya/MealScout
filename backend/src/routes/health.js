const router = require('express').Router()
const controller = require('../controllers/healthController')

router.get('/', controller.ping)

module.exports = router
