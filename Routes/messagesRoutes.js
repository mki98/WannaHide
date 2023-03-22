const express = require("express");
const router = express.Router();
const authController= require('../Controllers/authController')
const messageController= require('../Controllers/messageController')

router.use(authController.protect)
router.get('/:chat',messageController.getMsgs)
router.post('/',messageController.sendMessage)
module.exports = router