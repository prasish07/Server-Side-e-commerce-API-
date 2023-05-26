const CustomerError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { verifyJWT } = require("../utils");

const auth = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token)
    throw new CustomerError.UnauthenticatedError("Please login to continue");

  try {
    const decoded = verifyJWT({ token: token });
    // console.log(decoded);
    req.user = decoded;
    next();
  } catch (error) {
    throw new CustomerError.UnauthenticatedError("Wrong token");
  }
};

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new CustomerError.Unauthorized(
        "You are not authorized to access this route"
      );
    next();
  };
};

module.exports = { auth, authorizePermission };
