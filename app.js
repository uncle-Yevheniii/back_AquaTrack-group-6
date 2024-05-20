import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { router as pingRouter } from "./routes/pingRoute.js";
import { router as waterRouter } from "./routes/waterRoute.js";
import { errorGlobalHandler } from "./utils/errorGlobalHandler.js";
import { usersRouter } from "./routes/userRoute.js";

dotenv.config();

const app = express();
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

/**
 * SWAGER
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hello World",
      version: "0.1.0",
    },
  },
  apis: ["./src/routes*.js"], // files containing annotations as above
};

const specs = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * routes
 */
const pathPrefix = "/api";
app.use(`${pathPrefix}/`, pingRouter);
app.use(`${pathPrefix}/users`, usersRouter);
app.use(`${pathPrefix}/water`, waterRouter);

// not-found-route
app.all("*", (req, res) => {
  res.status(404).json({ message: "page not found" });
});

app.use(errorGlobalHandler);

/**
 * server-init
 */

const port = Number(process.env.PORT);
app.listen(port, () => {
  console.log(`Server is running. Use our API on port: ${port}`);
});
