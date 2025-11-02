import { Router } from "express";
import { createVoucher } from "../controllers/voucherController";

const voucherRouter = Router();

voucherRouter.post('/create-voucher', createVoucher);

export default voucherRouter;