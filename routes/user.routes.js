import { Router } from "express";

import { getUser, getUsers, updateUser } from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get('/', getUsers);

userRouter.get('/:id', authorize, getUser);

userRouter.put('/:id', authorize, updateUser);

export default userRouter;