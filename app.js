import express from "express";
import cookieParser from "cookie-parser";
import swaggerUi from 'swagger-ui-express'

import { PORT } from "./config/env.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import workflowRouter from "./routes/workflow.routes.js";

import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import swaggerDocument from "./config/swagger.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(arcjetMiddleware);

// Api Routes
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to the Subscription Tracker API!");
});

app.listen(PORT, async() => {
  console.log(`Subscription Tracker API is running on http://localhost:${PORT}`);

  await connectToDatabase();
});

export default app;