const mongoose = require("mongoose");

const ReviewScheme = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide the rating"],
    },
    title: {
      type: String,
      trim: true,
      maxLength: [100, "Cannot excede 100 word"],
      required: [true, "Please provide the title"],
    },
    comment: {
      type: String,
      required: [true, "comment field is empty"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
ReviewScheme.index({ product: 1, user: 1 }, { unique: true });

ReviewScheme.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfRating: { $sum: 1 },
      },
    },
  ]);
  //   console.log(result[0]);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        noOfReviews: result[0]?.numOfRating || 0,
      }
    );
  } catch (error) {}
};

ReviewScheme.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});
ReviewScheme.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", ReviewScheme);
