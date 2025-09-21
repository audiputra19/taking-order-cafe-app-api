import { Router } from "express";
import { acceptOrderByDapur, acceptOrderByKasir, finishOrder, getOrder, getOrderById, getOrderComplete, readyOrder } from "../controllers/orderController";

const orderRouter = Router();

orderRouter.post('/accept-kasir', acceptOrderByKasir);
orderRouter.post('/accept-dapur', acceptOrderByDapur);
orderRouter.post('/ready', readyOrder);
orderRouter.post('/finish', finishOrder);
orderRouter.get('/get-order', getOrder);
orderRouter.get('/get-order-complete', getOrderComplete);
orderRouter.get('/get-order-by-id/:id', getOrderById);

export default orderRouter;