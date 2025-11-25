const router = require('express').Router()
const controller = require('./tools')

router.post('/compare', controller.compare)
router.post('/recommend', controller.recommend)
router.post('/fetch/:platform', controller.fetchPlatform)
router.post('/history/save', controller.saveHistory)
router.post('/history/list', controller.listHistory)

module.exports = router
