const express = require("express");
const router = express.Router();
const authController= require('../Controllers/authController')
const usersController= require('../Controllers/usersController')


router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/confirm/:token', authController.confirmSignup);

router.use(authController.protect)
router.get('/profile',usersController.getMe)
router.route('/contacts').get(usersController.getContacts).post(usersController.addContact)
router.route('/requests').get(usersController.getRequests).post(usersController.confirmReq)
router.get('/:username',usersController.getUser)
module.exports = router