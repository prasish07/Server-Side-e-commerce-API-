const router = require("express").Router();
const {
  getAllReview,
  createReview,
  getSingleReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { auth, authorizePermission } = require("../middleware/authentication");

router.route("/").post(auth, createReview).get(getAllReview);

router
  .route("/:id")
  .get(getSingleReview)
  .patch(auth, updateReview)
  .delete(auth, deleteReview);

module.exports = router;
