import express, { Router, Request, Response } from "express";
import { userSchema, userTypeWithId } from "../schema/user";
import { User } from "../model/user";
import { z } from "zod";
import userAuth from "../middleware/userAuth";

const profileRouter: Router = express.Router();

//update profile info route
profileRouter.patch(
  "/editProfile",
  userAuth,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user as userTypeWithId;
      const { _id } = user;
      const editableProfileSchema = userSchema.omit({ email: true }).partial();
      const body = editableProfileSchema.parse(req.body);
      const updatedProfile = await User.findByIdAndUpdate(
        { _id },
        { ...body },
        { new: true, runValidators: true }
      );
      if(!updatedProfile){
        res.status(404).json({
            message: "user profile not found, unable to update"
        })
        return;
      }
      res.status(200).json({
        message: "profile updated successfully",
        user: updatedProfile,
      });
      return;
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: "invalid data that has to be updated",
        });
        return;
      }
      console.log(`internal server error: ${err}`);
      res.status(500).json({
        message: "internal server error",
      });
      return;
    }
  }
);

//get other profiles route
profileRouter.get(
  "/profiles",
  userAuth,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const data: Array<userTypeWithId> = await User.find();
      const profiles = data.filter((profile) => profile._id !== user._id);
      res
        .status(200)
        .json({ message: "profiles fetching successfull", data: profiles });
    } catch (err) {
      console.log(`something went wrong: ${err}`);
      res.status(500).json({ message: "something went wrong" });
      return;
    }
  }
);

export default profileRouter;
