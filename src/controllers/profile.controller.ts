import { Request, Response } from "express";
import { User } from "../model/user";
import { userTypeWithId } from "../schema/user";
import { connectionTypeWithId } from "../schema/connection";
import { userSchema } from "../schema/user";
import { z } from "zod";
import { Connection } from "../model/connection";
import { Types } from "mongoose";

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

export const feedApi = async (req: Request, res:Response)=>{
  try{
    const loggedinUser = (req as any).user as userTypeWithId;
    type loggedinUserConnectionsType = {
      fromUserId: Types.ObjectId,
      toUserId: Types.ObjectId
    }
    const loggedinUserConnections:Array<loggedinUserConnectionsType> = await Connection.find({
      $or:[
        {fromUserId: loggedinUser._id},
        {toUserId: loggedinUser._id}
      ]
    }).select(["fromUserId", "toUserId"]).lean();

    const connectedUsers = new Set<string>([loggedinUser._id.toString()]);
    loggedinUserConnections.forEach((users)=>{
      connectedUsers.add(users.fromUserId.toString());
      connectedUsers.add(users.toUserId.toString());
    })

    const users:Array<userTypeWithId> = await User.find({
      _id: { $nin: Array.from(connectedUsers)}
    }).lean<userTypeWithId[]>();

    if(users.length===0){
      res.status(200).json({
        success: true,
        message: "no user found",
        data: []
      })
      return;
    }
    res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: users
    })
    return;
  } catch(err){
    res.status(500).json({
      success: false,
      message: `internal server error: ${(err as Error).message}`
    })
    return;
  }
}

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
        data: [],
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "connections fetched successfully",
      data: connections,
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

export const acceptedConnections = async (req: Request, res: Response) => {
  try {
    const loggedinUser = (req as any).user as userTypeWithId;
    const fields = [
      "firstName",
      "lastName",
      "gender",
      "phoneNumber",
      "about",
      "profilePhotoUrl",
    ];
    const connections = await Connection.find({
      $or: [
        { fromUserId: loggedinUser._id, status: "accepted" },
        { toUserId: loggedinUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", fields)
      .populate("toUserId", fields);
    if (connections.length === 0) {
      res.status(200).json({
        success: true,
        message: "no connections found",
        data: [],
      });
      return;
    }
    const data = connections
      .map((connection) => {
        const fromId = connection.fromUserId?._id?.toString();
        const toId = connection.toUserId?._id?.toString();
        return fromId === loggedinUser._id.toString()
          ? connection.toUserId
          : connection.fromUserId;
      })
      .filter(Boolean); //this removes undefined values
    res.status(200).json({
      success: true,
      message: "accepted connections fetched successfully",
      data: data,
    });
    return;
  } catch (error) {
    const err = error as Error;
    console.log("an error occurred: ", err);
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: err.message,
    });
    return;
  }
};

export const viewProfile = async (req: Request, res: Response) => {
    try{
        const user = (req as any).user as userTypeWithId;
        res.status(200).json({
            success: true,
            message: "user profile fetched successfully",
            data: user
        });
        return;
    } catch(err){
        console.log("something went wrong: ",err);
        res.status(500).json({
            success: false,
            message: "internal server error",
            error: err
        })
        return;
    }
}