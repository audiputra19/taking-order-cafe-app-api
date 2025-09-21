import { Router } from "express";
import { createProduct, discontinueProduct, getProduct, updateProduct, upload } from "../controllers/productController";

const productRouter = Router();

productRouter.post('/create-product', upload.single('file'), createProduct);
productRouter.get('/get-product', getProduct);
productRouter.put('/update-product/:id', upload.single('file'), updateProduct);
productRouter.put('/dis-product/:id', discontinueProduct);

export default productRouter;
