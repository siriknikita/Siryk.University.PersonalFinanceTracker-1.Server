require("dotenv").config();

const appInsights = require("applicationinsights");
appInsights
  .setup(process.env.AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true)
  .setUseDiskRetryCaching(true)
  .start();

const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const app = express();
const cookieParser = require('cookie-parser')

app.use(
  cors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  try {
    res.send("Test Hello World from server!");
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

const authRoutes = require("./routes/auth.routes");
const goalsRoutes = require("./routes/goals.routes");
const userRoutes = require("./routes/user.routes");
const transactionsRoutes = require("./routes/transactions.routes");
const adminRoutes = require("./routes/admin.routes");
const blobRoutes = require("./routes/blobStorage.routes");
const { cookieJWTAuth } = require("./middleware/cookieJWTAuth");

app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/goals", cookieJWTAuth, goalsRoutes);
app.use("/api/user", cookieJWTAuth, userRoutes);
app.use("/api/transactions", cookieJWTAuth, transactionsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blob", cookieJWTAuth, blobRoutes);

const PORT = process.env.PORT || 8080;

sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized");
    app.listen(PORT, () => {
      console.log(`Server starts on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
