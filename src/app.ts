import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, response } from 'express';
import cors from "cors";
import path from 'path';
import productRouter from './routers/productRouter';
import orderRouter from "./routers/orderRouter";
import http from 'http';
import { initSocket } from "./socket";
import authRouter from "./routers/authRouter";
import userRouter from "./routers/userRouter";

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", productRouter);
app.use("/order", orderRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome back!");
});

server.listen(port, () => {
    console.log(`Server running at ${port}`);
});