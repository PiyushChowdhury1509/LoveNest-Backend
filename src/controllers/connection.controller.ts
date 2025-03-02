import { userTypeWithId } from "../schema/user";
import { Request, Response } from "express";
import { User } from "../model/user";
import mongoose, { isValidObjectId } from "mongoose";
import { Connection } from "../model/connection";
import { connectionTypeWithId } from "../schema/connection";

export const sendConnection = async (req: Request, res: Response) => {
  try {
    const { status, userId } = req.params;
    const user = (req as any).user as userTypeWithId;
    if (!["interested", "ignored"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "invalid status",
      });
      return;
    }
    if (!isValidObjectId(userId)) {
      res.status(400).json({
        success: false,
        message: "invalid user id",
      });
      return;
    }
    const oppositeUser = User.findOne({ _id: userId });
    if (!oppositeUser) {
      res.status(404).json({
        success: false,
        message: "no user found with this object id",
      });
      return;
    }
    const existingConnection: connectionTypeWithId | null =
      await Connection.findOne({
        $or: [
          { fromUserId: user._id, toUserId: userId },
          { fromUserId: userId, toUserId: user._id },
        ],
      });
    if (existingConnection) {
      res.status(400).json({
        success: false,
        message: "connection already exists",
      });
      return;
    }
    const connection = new Connection({
      fromUserId: user._id,
      toUserId: userId,
      status,
    });
    const savedConnection = await connection.save();
    res.status(200).json({
      success: true,
      message: "connection sent successfully",
      connection: savedConnection,
    });
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
    return;
  }
};

export const reviewConnection = async (req: Request, res: Response) => {
  try {
    const { status, connectionId } = req.params;
    const user = (req as any).user as userTypeWithId;
    if (!["accepted", "rejected"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "invalid status",
      });
      return;
    }
    if (!isValidObjectId(connectionId)) {
      res.status(400).json({
        success: false,
        message: "invalid connection id",
      });
      return;
    }
    const connection: (connectionTypeWithId & mongoose.Document) | null =
      await Connection.findOne({
        _id: connectionId,
        toUserId: user._id,
        status: "interested",
      });
    if (!connection) {
      res.status(404).json({
        success: false,
        message: "no such connection found",
        connection: connection,
      });
      return;
    }
    connection.status = status as "accepted" | "rejected";
    const savedConnection = await connection.save();
    res.status(200).json({
      success: true,
      message: `connection ${status} successfully`,
      connection: savedConnection,
    });
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
    return;
  }
};

export const cancelConnection = async (req: Request, res: Response) => {
  try {
    const loggedinUser = (req as any).user as userTypeWithId;
    const { connectionId } = req.params;
    if (!isValidObjectId(connectionId)) {
      res.status(400).json({
        success: false,
        message: "invalid connectionId",
      });
      return;
    }
    const connection: (connectionTypeWithId & mongoose.Document) | null = await Connection.findOne({
      $or: [
        {
          fromUserId: loggedinUser._id,
          toUserId: connectionId,
          status: "accepted",
        },
        {
          fromUserId: connectionId,
          toUserId: loggedinUser._id,
          status: "accepted",
        },
      ],
    });

    if(!connection){
      res.status(404).json({
        success: false,
        message: "no active connections found to cancel"
      });
      return;
    }
    connection.status = "rejected";
    const savedConnection = await connection.save();
    res.status(200).json({
      success: true,
      message: "connection cancelled successfully",
      data: savedConnection
    });
    return;

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: err
    });
    return;
  }
};
