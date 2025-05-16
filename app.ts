import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import errorHandler from "./src/middlewares/error.middleware";
import trackRouter from "./src/routes/track.route";

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" }));
app.use(bodyParser.text({ limit: "5mb" }));

app.use("/track", trackRouter);

app.use(errorHandler);

export default app;
