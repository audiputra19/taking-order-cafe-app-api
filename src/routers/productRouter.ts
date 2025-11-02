import { Router } from "express";
import { activateProduct, createProduct, discontinueProduct, getProduct, getProductDiscontinue, updateProduct, upload } from "../controllers/productController";

const productRouter = Router();

productRouter.post('/create-product', upload.single('file'), createProduct);
productRouter.get('/get-product', getProduct);
productRouter.get('/get-product-discontinue', getProductDiscontinue);
productRouter.put('/update-product/:id', upload.single('file'), updateProduct);
productRouter.put('/dis-product/:id', discontinueProduct);
productRouter.put('/activate-product/:id', activateProduct);

export default productRouter;
