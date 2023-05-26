const { StatusCodes } = require("http-status-codes");
const customError = require("../errors");
const { checkPermission } = require("../utils");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  if (!orders || !orders.length) {
    throw new customError.BadRequestError("No order found");
  }

  res.status(StatusCodes.OK).json({ orders });
};
const getSingleOrders = async (req, res) => {
  console.log(req.params.id);
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new customError.BadRequestError("No order found");
  }
  checkPermission(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (req, res) => {
  const userId = req.user.userId;
  const orders = await Order.find({ user: userId });
  if (!orders) throw new customError.BadRequestError("No orders");
  res.status(StatusCodes.OK).json({ user: orders });
};

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRamdomValue";
  return { client_secret, amount };
};
const createOrders = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new customError.BadRequestError("No cart item provided!!");
  }
  if (!tax || !shippingFee)
    throw new customError.BadRequestError(
      "Please provide tax and shipping fee"
    );

  let orderItems = [];
  let subTotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findById(item.product);
    if (!dbProduct) {
      throw new customError.NotFoundError("No item with that id");
    }
    const { name, price, image, _id } = dbProduct;
    // console.log(name, price, image);
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // Add item to orderItems
    orderItems = [...orderItems, singleOrderItem];

    // Calculate the sub total
    subTotal += item.amount * price;
  }
  console.log(orderItems);
  console.log(subTotal);

  // Calculate total
  const total = tax + shippingFee + subTotal;

  //get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    cartItems: orderItems,
    total,
    subTotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};
const updateOrders = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });
  // console.log(order.user);
  if (!order) {
    throw new customError.BadRequestError(`No Order with id: ${orderId}`);
  }
  checkPermission(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";

  await order.save();

  res.status(StatusCodes.OK).json({ msg: "Order updated", order });
};

module.exports = {
  getAllOrders,
  getSingleOrders,
  getCurrentUserOrders,
  createOrders,
  updateOrders,
};
