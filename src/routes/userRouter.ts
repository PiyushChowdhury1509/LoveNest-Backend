import express, { Router,RequestHandler } from 'express';
import { createUser,loginUser,logoutUser,deleteUser } from '../controllers/user.controller';

const userRouter:Router = express.Router();

userRouter.post('/signup', createUser as RequestHandler);
userRouter.post('/signin', loginUser as RequestHandler);
userRouter.post('/logout', logoutUser as RequestHandler);
userRouter.delete('/deleteUser', deleteUser as RequestHandler);

export default userRouter;