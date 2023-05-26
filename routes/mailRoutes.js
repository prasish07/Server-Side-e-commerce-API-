const express = require("express");
const router = express.Router();

const sendEmail = require("../controllers/sendEmail");

router.route("/sendEmail").post(sendEmail);

module.exports = router;
