const router = require('express').Router()
const controller = require('../controllers/analyticsController')

router.get('/city-summary', controller.citySummary)
router.get('/serviceability-gaps', controller.serviceabilityGaps)

module.exports = router
