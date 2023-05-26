const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomerError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  const products = await Product.create({ ...req.body, user: req.user.userId });
  res.status(StatusCodes.CREATED).json(products);
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  if (!products)
    throw new CustomerError.NotFoundError("The product list is empty");
  res.status(StatusCodes.OK).json({ status: "success", products: products });
};
const getSingleProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("reviews");
  if (!product)
    throw new CustomerError.NotFoundError(
      `No product with the id ${req.params.id}`
    );
  res.status(StatusCodes.OK).json({ status: "success", product: product });
};
const updateProduct = async (req, res) => {
  const user = await Product.findById(req.params.id);
  if (user.user.toString() !== req.user.userId)
    throw new CustomerError.Unauthorized("Unauthorized");
  const product = await Product.findOneAndUpdate(
    req.params.id,
    { ...req.body },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!product)
    throw new CustomerError.NotFoundError(
      `No product with the id ${req.params.id}`
    );
  res.status(StatusCodes.OK).json({ status: "Success" });
};
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    throw new CustomerError.NotFoundError(
      `No product with the id ${req.params.id}`
    );
  if (product.user.toString() !== req.user.userId)
    throw new CustomerError.Unauthorized("Unauthorized");
  await product.remove();

  res
    .status(StatusCodes.OK)
    .json({ status: "Product successfully deleted", success: true });
};
const uploadImage = async (req, res) => {
  console.log(req.files);
  if (!req.files)
    throw new CustomerError.BadRequestError("Files does not exist!!!");
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image"))
    throw new CustomerError.BadRequestError("Please upload image type!!!");
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize)
    throw new CustomerError.BadRequestError(
      "Please upload the image smaller than 1 mb!!"
    );
  const imagePath = path.join(
    __dirname,
    "../Public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
