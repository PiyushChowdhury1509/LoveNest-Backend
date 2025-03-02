import express, { Router,RequestHandler } from "express";
import userAuth from "../middleware/userAuth";
import { reviewConnection, sendConnection, cancelConnection } from "../controllers/connection.controller";

const connectionRouter: Router = express.Router();

connectionRouter.post('/send/:status/:userId', userAuth, sendConnection as RequestHandler);
connectionRouter.post('/review/:status/:connectionId', userAuth, reviewConnection as RequestHandler);
connectionRouter.post('/unmatch/:connectionId',userAuth, cancelConnection as RequestHandler);

export default connectionRouter;
