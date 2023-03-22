const express = require("express");
const router = express.Router();
const authController= require('../Controllers/authController')
const chatController= require('../Controllers/chatController')

router.use(authController.protect)
router.route('/').get(chatController.getChats).post(chatController.createChat)
module.exports = router