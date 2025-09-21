import { Router } from "express";
import { createUser, deleteUser, getUser } from "../controllers/userController";

const userRouter = Router();

userRouter.post('/create-user', createUser);
userRouter.get('/get-user', getUser);
userRouter.put('/delete-user/:username', deleteUser)

export default userRouter;