require("dotenv").config();
require("express-async-errors");

const morgon = require("morgan");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const authrouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const { auth, authorizePermission } = require("./middleware/authentication");
const fileUpload = require("express-fileupload");
const reviewRoute = require("./routes/reviewRoutes");
const orderRoute = require("./routes/orderRoutes");
const mailRoute = require("./routes/mailRoutes");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSenitize = require("express-mongo-sanitize");

const connectDb = require("./db/connect");

const port = process.env.PORT || 5000;
const notFoundMiddleware = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(
  cors({
    origin: ["https://e-commerece-8971.netlify.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(xss());
app.use(mongoSenitize());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./Public"));
app.use(fileUpload({ useTempFiles: true }));

// Remove this code block
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://e-commerece-8971.netlify.app" || "http://localhost:3000"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  res.send("<h1>E-commerece API</h1><a href='/api-docs'>Documentation</a>");
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// routes
app.use("/api/v1/auth", authrouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/", mailRoute);

// middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// listen
const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
