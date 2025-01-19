import express, { Router, Request, Response } from "express";
import userAuth from "../middleware/userAuth";
import { Connection } from "../model/connection";
import { connectionSchema, connectionTypeWithId } from "../schema/connection";
import { z } from "zod";
import { User } from "../model/user";
import { userTypeWithId } from "../schema/user";
import { isValidObjectId } from "mongoose";

const connectionRouter: Router = express.Router();

connectionRouter.post(
  "/send/:status/:userId",
  userAuth,
  async (req: Request, res: Response) => {
    try {
      const user:userTypeWithId = (req as any).user;
      const { status, userId } = req.params;
      if (!status || !userId) {
        res.status(400).json({
          message: "request is invalid",
        });
        return;
      }

      if (!isValidObjectId(userId)) {
        res.status(400).json({ message: "Invalid userId format" });
        return;
      }

      if (!["interested", "ignored"].includes(status)) {
        res.status(400).json({
          message: "invalid status",
        });
        return;
      }
      const oppositeUser: userTypeWithId | null = await User.findById(userId);
      if (!oppositeUser) {
        res.status(400).json({
          message: "opposite user doesnt exist",
        });
        return;
      }
      const connection = {
        fromUserId: user._id,
        toUserId: userId,
        status,
      };
      const validatedConnection = connectionSchema.parse(connection);
      const existingRequest: connectionTypeWithId | null =
        await Connection.findOne({
          $or: [
            { fromUserId: user._id, toUserId: userId },
            { fromUserId: userId, toUserId: user._id },
          ],
        });
      if (existingRequest) {
        res.status(400).json({
          message: "connection request already exist",
          data: existingRequest,
        });
        return;
      }
      const newConnection = new Connection(validatedConnection);
      const data = await newConnection.save();
      res.status(201).json({
        message: "connection sent successfully",
        data: data,
      });
      return;
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: "invalid request data",
          eror: err.errors,
        });
        return;
      }
      res.status(500).json({
        message: "something went wrong",
      });
      return;
    }
  }
);

export default connectionRouter;
