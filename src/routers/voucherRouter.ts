import { Router } from "express";
import { createVoucher, deleteVoucher, getVoucher, updateVoucher } from "../controllers/voucherController";

const voucherRouter = Router();

voucherRouter.post('/create-voucher', createVoucher);
voucherRouter.post('/get-voucher/:outlet_id', getVoucher);
voucherRouter.put('/update-voucher/:id', updateVoucher);
voucherRouter.put('/delete-voucher/:id', deleteVoucher);

export default voucherRouter;