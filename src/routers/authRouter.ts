import { Router } from "express";
import { loginController, me, registerController } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";

const authRouter = Router();
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/me", authenticateToken, me);

export default authRouter;