const express = require("express");
const router = express.Router();
const viewsController = require("../Controllers/viewsController");
const authController = require("../Controllers/authController");

router.get("/accounts", viewsController.authUser);
router.get("/logout", viewsController.logout);
router.get("/", viewsController.index);
router.get("/chat", authController.viewProtect, viewsController.chat);
router.get("/confirm/:token", viewsController.ConfirmSingup);

module.exports = router;
