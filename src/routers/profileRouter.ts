import { Router } from "express";
import { createCompanyProfileController, customizeCompanyProfileController, getCompanyProfileController, uploadCompanyLogo } from "../controllers/profileController";

const profileRouter = Router();

profileRouter.post('/create-company-profile', uploadCompanyLogo.single("file"), createCompanyProfileController);
profileRouter.get('/get-company-profile/:outlet_id', getCompanyProfileController)
profileRouter.post('/customize-company-profile', customizeCompanyProfileController)

export default profileRouter;