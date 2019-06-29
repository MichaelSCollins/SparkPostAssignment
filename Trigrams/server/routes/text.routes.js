import express from 'express'
import ctrl from '../controllers/text.controller'

const router = express.Router()

router.route('/upload')
  .post(ctrl.upload)

router.route('/texts')
  .get(ctrl.getTexts)

router.route('/texts/:id')
  .get(ctrl.getTextInfo)

  router.route('/texts/:id/generate')
  .get(ctrl.generateTrigramText)

export default router
