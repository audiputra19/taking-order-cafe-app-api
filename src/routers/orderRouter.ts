import { Router } from "express";
import { acceptOrderByDapur, acceptOrderByKasir, cancelOrderByKasir, finishOrder, getOrder, getOrderById, getOrderComplete, paidOrderByKasir, readyOrder } from "../controllers/orderController";

const orderRouter = Router();

orderRouter.post('/paid-kasir', paidOrderByKasir);
orderRouter.post('/cancel-kasir', cancelOrderByKasir);
orderRouter.post('/accept-kasir', acceptOrderByKasir);
orderRouter.post('/accept-dapur', acceptOrderByDapur);
orderRouter.post('/ready', readyOrder);
orderRouter.post('/finish', finishOrder);
orderRouter.get('/get-order', getOrder);
orderRouter.get('/get-order-complete', getOrderComplete);
orderRouter.get('/get-order-by-id/:id', getOrderById);

export default orderRouter;