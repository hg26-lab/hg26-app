const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const port = process.env.PORT || 3000;

app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many attempts, please try again later."
});

app.use("/login", authLimiter);

app.get("/", (req, res) => {
  res.send("Node server is working");
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Server running on port ${port}`);
});

