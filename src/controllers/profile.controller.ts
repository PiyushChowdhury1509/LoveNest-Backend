import { Request, Response } from "express";
import { User } from "../model/user";
import { userTypeWithId } from "../schema/user";
import { connectionTypeWithId } from "../schema/connection";
import { userSchema } from "../schema/user";
import { z } from "zod";
import { Connection } from "../model/connection";

export const editUser = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as userTypeWithId;
    const body = req.body;
    const { _id } = user;
    const editUserSchema = userSchema.omit({ email: true }).partial();
    const sanitizedbody = editUserSchema.parse(body);
    const editedUser: userTypeWithId | null = await User.findByIdAndUpdate(
      { _id },
      { ...sanitizedbody },
      { new: true, runValidators: true }
    );
    if (!editedUser) {
      res.status(404).json({
        success: false,
        message: "no user found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "user updated successfully",
      user: editedUser,
    });
    return;
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "something went wrong with the server",
      error: err,
    });
    return;
  }
};

export const feedApi = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as userTypeWithId;
    const { _id } = user;
    const otherUsers: Array<userTypeWithId> = await User.find();
    const feed = otherUsers.filter(
      (user) => user._id.toString() != _id.toString()
    );
    if (feed.length === 0) {
      res.status(200).json({
        success: true,
        message: "no other users found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "feed api fetched successfully",
      users: feed,
    });
    return;
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "invalid request data",
        error: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: err,
    });
    return;
  }
};

export const recievedConnections = async (req: Request, res: Response) => {
  try {
    const loggedinUser = (req as any).user as userTypeWithId;
    const connections = await Connection.find({
      toUserId: loggedinUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "gender",
      "phoneNumber",
      "about",
      "profilePhotoUrl",
    ]);

    if (connections.length === 0) {
      res.status(200).json({
        success: true,
        message: "no connections",
        connections: [],
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "connections fetched successfully",
      connections: connections,
    });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
    return;
  }
};
