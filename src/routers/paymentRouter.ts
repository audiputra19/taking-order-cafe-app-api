import { Router } from "express";
import { AddDigitalPayment } from "../controllers/paymentController";

const paymentRouter = Router();

paymentRouter.post('/add-digipay', AddDigitalPayment);

export default paymentRouter;