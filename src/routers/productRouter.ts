import { Router } from "express";
import { activateProduct, createProduct, discontinueProduct, getProduct, getProductDiscontinue, updateProduct, uploadProductImage } from "../controllers/productController";

const productRouter = Router();

productRouter.post('/create-product', uploadProductImage.single('file'), createProduct);
productRouter.get('/get-product/:outlet_id', getProduct);
productRouter.get('/get-product-discontinue/:outlet_id', getProductDiscontinue);
productRouter.put('/update-product/:id', uploadProductImage.single('file'), updateProduct);
productRouter.put('/dis-product/:id', discontinueProduct);
productRouter.put('/activate-product/:id', activateProduct);

export default productRouter;
