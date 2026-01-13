import { Router } from "express";
import { AddOutletController, GetOutletController } from "../controllers/outletCOntroller";

const outletRouter = Router();

outletRouter.post("/add-outlet", AddOutletController);
outletRouter.get("/get-outlet/:company_id", GetOutletController);

export default outletRouter;