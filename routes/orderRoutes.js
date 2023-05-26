const router = require("express").Router();
const {
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrders,
  createOrders,
  updateOrders,
} = require("../controllers/OrderController");
const { auth, authorizePermission } = require("../middleware/authentication");

router
  .route("/")
  .get(auth, authorizePermission("admin"), getAllOrders)
  .post(auth, createOrders);

router.route("/showAllMyOrders").get(auth, getCurrentUserOrders);

router.route("/:id").get(auth, getSingleOrders).patch(auth, updateOrders);

module.exports = router;
