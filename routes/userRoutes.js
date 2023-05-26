const express = require("express");
const router = express.Router();
const { auth, authorizePermission } = require("../middleware/authentication");

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  uploadProfile,
  uploadUserv2,
} = require("../controllers/userController");

router.route("/").get(auth, authorizePermission("admin", "owner"), getAllUsers);

router.route("/showMe").get(auth, showCurrentUser);
router.route("/updateUser").patch(auth, updateUser);
router.route("/updateUserPassword").patch(auth, updateUserPassword);
router.route("/uploadProfile").post(uploadProfile);
router.route("/uploadUserv2").post(auth, uploadUserv2);

router.route("/:id").get(auth, getSingleUser);

module.exports = router;
