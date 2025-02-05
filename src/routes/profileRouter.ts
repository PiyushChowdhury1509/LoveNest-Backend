import express, { Router, RequestHandler } from "express";
import { editUser,feedApi,recievedConnections,acceptedConnections,viewProfile } from "../controllers/profile.controller";
import userAuth from "../middleware/userAuth";

const profileRouter: Router = express.Router();

profileRouter.patch('/editProfile',userAuth, editUser as RequestHandler);
profileRouter.get('/feed', userAuth, feedApi as RequestHandler);
profileRouter.get('/recievedConnectionRequests',userAuth,recievedConnections as RequestHandler);
profileRouter.get('/acceptedConnections', userAuth, acceptedConnections as RequestHandler);
profileRouter.get('/viewProfile', userAuth, viewProfile as RequestHandler);

export default profileRouter;
