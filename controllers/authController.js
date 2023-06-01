const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const CustomerError = require("../errors");
const jwt = require("jsonwebtoken");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const { createJWT } = require("../utils/jwt");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const emailAlreadyExist = await User.findOne({ email });
  if (emailAlreadyExist)
    throw new CustomerError.BadRequestError("Email already exist");

  //first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const users = await User.create({ name, email, password, role });

  const tokenPayload = createTokenUser(users);
  console.log(tokenPayload);

  attachCookiesToResponse({ res, tokenPayload });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new BadRequestError("Invalid credentials");
  }
  const tokenPayload = {
    name: user.name,
    userId: user._id,
    role: user.role,
  };
  attachCookiesToResponse({ res, tokenPayload });
  const token = createJWT({ payload: tokenPayload });

  res.status("200").json({ success: true, data: user, token: token });
};
const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ success: true, msg: "logout" });
};

module.exports = { register, login, logout };
