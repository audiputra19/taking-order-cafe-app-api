import { Router } from "express";
import { activateCategory, addCategory, deleteCategory, discontinueCategory, getCategory, getDiscontinueCategory, updateCategory } from "../controllers/categoryController";

const categoryRouter = Router();

categoryRouter.post("/add-category", addCategory);
categoryRouter.get("/get-category/:outlet_id", getCategory);
categoryRouter.get("/get-dis-category/:outlet_id", getDiscontinueCategory);
categoryRouter.put("/dis-category", discontinueCategory);
categoryRouter.put("/activate-category", activateCategory);
categoryRouter.put("/delete-category", deleteCategory);
categoryRouter.put("/update-category", updateCategory);

export default categoryRouter;