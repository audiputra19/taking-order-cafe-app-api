import { Router } from "express";
import { acceptOrderByDapur, acceptOrderByKasir, cancelOrderByKasir, finishOrder, getOrder, getOrderById, getOrderComplete, paidOrderByKasir, readyOrder } from "../controllers/orderController";

const orderRouter = Router();

orderRouter.post('/paid-kasir', paidOrderByKasir);
orderRouter.post('/cancel-kasir', cancelOrderByKasir);
orderRouter.post('/accept-kasir', acceptOrderByKasir);
orderRouter.post('/accept-dapur', acceptOrderByDapur);
orderRouter.post('/ready', readyOrder);
orderRouter.post('/finish', finishOrder);
orderRouter.post('/get-order', getOrder);
orderRouter.get('/get-order-complete/:sortBy/:year/:month/:dateFrom/:dateTo/:process/:outlet_id', getOrderComplete);
orderRouter.post('/get-order-by-id', getOrderById);

export default orderRouter;