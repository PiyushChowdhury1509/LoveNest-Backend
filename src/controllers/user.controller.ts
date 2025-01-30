import { User } from "../model/user";
import { userTypeWithId } from "../schema/user";
import { Request, Response } from "express";
import { userSchema } from "../schema/user";
import { z } from "zod";
import hashPassword from "../utils/hashPassword";
import comparePassword from "../utils/comparePassword";

export const createUser = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const verifiedData = userSchema.parse(body);
    const { password } = verifiedData;
    const hashedPassword = await hashPassword(password);
    verifiedData.password = hashedPassword;
    const newUser = new User(verifiedData);
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "user successfully created",
      user: newUser,
    });
    return;
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "the signup data is invalid",
        error: err.errors,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "something is wrong with the server",
      error: err,
    });
    return;
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const loginUserSchema = userSchema.pick({
      email: true,
      password: true,
    });
    const body = req.body;
    const verifiedData = loginUserSchema.parse(body);
    const user: userTypeWithId | null = await User.findOne({
      email: verifiedData.email,
    });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "no user found with this data",
      });
      return;
    }
    const isPasswordCorrect: boolean = await comparePassword(
      verifiedData.password,
      user.password
    );
    if (!isPasswordCorrect) {
      res.status(401).json({
        success: false,
        message: "wrong credentials",
      });
      return;
    }
    const token: string = user.getJwt();
    res.cookie("token", token);
    res.status(200).json({
      success: true,
      message: "signin successfull",
    });
    return;
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "invalid login data",
        error: err.errors,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "something is wrong with the server",
      error: err,
    });
    return;
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.cookie("cookie", null, {
      expires: new Date(0),
    });
    res.status(200).json({
      success: true,
      message: "logout successfull",
    });
    return;
  } catch (err) {
    res.status(500).json({
      message: "something went wrong with the server",
      success: false,
    });
    return;
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const deleteUserType = userSchema.pick({
      email: true,
      password: true,
    });
    const sanitizedBody = deleteUserType.parse(body);
    const user: userTypeWithId | null = await User.findOne({
      email: sanitizedBody.email,
    });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "no user found with this email id",
      });
      return;
    }
    const isPasswordCorrect = comparePassword(
      sanitizedBody.password,
      user.password
    );
    if (!isPasswordCorrect) {
      res.status(401).json({
        success: false,
        message: "incorrect password",
      });
      return;
    }
    const deletedUser: userTypeWithId | null = await User.findOneAndDelete({
      email: sanitizedBody.email,
    });
    res.status(200).json({
      success: true,
      message: "user deleted successfully",
      user: deletedUser,
    });
    return;
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "bad request body",
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "something went wrong with the server",
    });
    return;
  }
};
