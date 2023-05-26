const Review = require("../models/Review");
const { StatusCodes } = require("http-status-codes");
const customError = require("../errors");
const { checkPermission } = require("../utils");
const Product = require("../models/Product");

const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const productCheck = await Product.findById(productId);
  if (!productCheck)
    throw new customError.NotFoundError("Product not found!!!");

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadySubmitted)
    throw new customError.BadRequestError(
      "Already submitted review for this product!!"
    );

  //   const reviews = await Review.create({
  //     ...req.body,
  //     user: req.user.userId,
  //   });
  const reviews = new Review({
    ...req.body,
    user: req.user.userId,
  });
  await reviews.save();
  res.status(StatusCodes.CREATED).json({ status: "success", review: reviews });
};
const getAllReview = async (req, res) => {
  const review = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  });
  if (!review) throw new customError.NotFoundError("No review found");
  res.status(StatusCodes.OK).json({ reviews: review, count: review.length });
};
const updateReview = async (req, res) => {
  const userIdInProduct = await Review.findById(req.params.id);
  if (!userIdInProduct)
    throw new customError.NotFoundError(
      `No review found by the name ${req.params.id}`
    );
  checkPermission(req.user, userIdInProduct.user);
  //   const review = await Review.findOneAndUpdate(
  // { _id: req.params.id },
  // { ...req.body },
  // {
  //   runValidators: true,
  //   new: true,
  // }
  //   );
  const { rating, title, comment } = req.body;
  userIdInProduct.rating = rating;
  userIdInProduct.title = title;
  userIdInProduct.comment = comment;
  await userIdInProduct.save();
  res.status(200).json({ msg: "success", review: userIdInProduct });
};
const getSingleReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review)
    throw new customError.NotFoundError(
      `No review found by the name ${req.params.id}`
    );
  res.status(StatusCodes.OK).json({ reviews: review });
};
const deleteReview = async (req, res) => {
  const userIdInProduct = await Review.findById(req.params.id);
  if (!userIdInProduct) {
    throw new customError.NotFoundError(
      `No review found by the name ${req.params.id}`
    );
  }
  checkPermission(req.user, userIdInProduct.user);
  //   const review = await Review.findByIdAndDelete(req.params.id);
  await userIdInProduct.remove();

  res.status(200).send("delete review");
};

const getSingleProductReview = async (req, res) => {
  const { id: productId } = req.params;
  const review = await Review.find({ product: productId });
  if (!review.length)
    throw new customError.NotFoundError("No review with that particular id!!");
  res.status(StatusCodes.OK).json({ reviews: review, count: review.length });
};

module.exports = {
  createReview,
  getAllReview,
  updateReview,
  getSingleReview,
  deleteReview,
  getSingleProductReview,
};
