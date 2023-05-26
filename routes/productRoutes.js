const router = require("express").Router();
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");
const { auth, authorizePermission } = require("../middleware/authentication");
const { getSingleProductReview } = require("../controllers/reviewController");

router
  .route("/")
  .post([auth, authorizePermission("admin")], createProduct)
  .get(getAllProducts);

router.route("/uploadImage").post(uploadImage);

router
  .route("/:id")
  .get(getSingleProduct)
  .delete(auth, authorizePermission("admin"), deleteProduct)
  .patch(auth, authorizePermission("admin"), updateProduct);

router.route("/:id/review").get(getSingleProductReview);

module.exports = router;
