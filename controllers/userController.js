const User = require("../models/User");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const customeError = require("../errors");
const fs = require("fs");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermission,
} = require("../utils");
const { BadRequestError } = require("../errors/index");
const { StatusCodes } = require("http-status-codes");
const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select("-password");
  res.status(200).json({
    success: true,
    msg: users,
  });
};
const getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) throw new customeError.NotFoundError("User not found");

  checkPermission(req.user, user._id);

  res.status(200).json({
    success: true,
    msg: user,
  });
};

const showCurrentUser = async (req, res) => {
  console.log(req.user);
  const { name, userId, role } = req.user;
  const user = await User.findById(userId);
  res.status(200).json({
    user: { data: user },
  });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    throw new customeError.BadRequestError("Please provide name and email");
  // const user = await User.findOneAndUpdate(
  //   { _id: req.user.userId },
  //   { email, name },
  //   {
  //     new: true,
  //     runValida rs: true,
  //   }
  // );
  const user = await User.findById(req.user.userId);
  user.name = name;
  user.email = email;
  await user.save();
  const tokenPayload = createTokenUser(user);
  attachCookiesToResponse({ res, tokenPayload });

  res.status(200).json({
    success: true,
    msg: user,
  });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new customeError.BadRequestError(
      "Please provide old and new password"
    );
  const user = await User.findById(req.user.userId).select("+password");
  const check = await user.comparePassword(oldPassword);
  if (!check) throw new customeError.BadRequestError("Wrong password");
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    status: "password updated",
  });
};

// const uploadProfile = async (req, res) => {
//   if (!req.files) {
//     throw new BadRequestError("Not found");
//   }
//   const productImage = req.files.Image;
//   if (!productImage.mimetype.startsWith("image")) {
//     throw new CustomError.BadRequestError("Please select an image type file");
//   }

//   const maxSize = 1024 * 1024 * 1024;

//   if (productImage.size > maxSize) {
//     throw new BadRequestError("please upload image less than 10mb");
//   }
//   const ImagePath = path.join(
//     __dirname,
//     "../Public/uploads/" + `${productImage.name}`
//   );
//   await productImage.mv(ImagePath);
//   return res.status(StatusCodes.OK).json({
//     image: { src: `http://localhost:5000/uploads/${productImage.name}` },
//   });
// };

const uploadProfile = async (req, res) => {
  const result = await cloudinary.uploader.upload(
    req.files.Image.tempFilePath,
    { use_filename: true, folder: "file-upload" }
  );
  fs.unlinkSync(req.files.Image.tempFilePath); // corrected to req.files.Image
  res.status(200).json({ image: { src: result.secure_url } }); // corrected to 200
};

const uploadUserv2 = async (req, res) => {
  console.log(req.user.userId);
  const user = await User.findByIdAndUpdate(req.user.userId, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(StatusCodes.OK).json({ success: "OK", user });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  uploadProfile,
  uploadUserv2,
};
