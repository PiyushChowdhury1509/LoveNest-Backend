import express, { Router, RequestHandler } from "express";
import { editUser,feedApi } from "../controllers/profile.controller";
import userAuth from "../middleware/userAuth";

const profileRouter: Router = express.Router();

profileRouter.patch('/editProfile',userAuth, editUser as RequestHandler);
profileRouter.get('/feed', userAuth, feedApi as RequestHandler);

export default profileRouter;
