import { Router } from "express";
import { getCities, getDistrict, getProvinces, getVillages } from "../controllers/wilayahController";

const wilayahRouter = Router();

wilayahRouter.get("/provinces", getProvinces);
wilayahRouter.get("/cities/:provinceId", getCities);
wilayahRouter.get("/districts/:cityId", getDistrict);
wilayahRouter.get("/villages/:districtId", getVillages);

export default wilayahRouter;