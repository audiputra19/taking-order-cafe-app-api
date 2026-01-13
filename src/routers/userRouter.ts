import { Router } from "express";
import { createUser, deleteUser, getUser } from "../controllers/userController";

const userRouter = Router();

userRouter.post('/create-user', createUser);
userRouter.get('/get-user/:outlet_id', getUser);
userRouter.put('/delete-user', deleteUser)

export default userRouter;