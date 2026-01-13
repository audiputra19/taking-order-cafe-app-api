import { Router } from "express";
import { createCompanyProfileController, getCompanyProfileController, upload } from "../controllers/profileController";

const profileRouter = Router();

profileRouter.post('/create-company-profile', upload.single("file"), createCompanyProfileController);
profileRouter.get('/get-company-profile/:outlet_id', getCompanyProfileController)

export default profileRouter;