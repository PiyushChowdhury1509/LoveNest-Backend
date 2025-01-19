import { Types } from "mongoose";
import { z } from "zod";

export const connectionSchema = z.object({
  fromUserId: z
    .union([
      z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid ObjectId for fromUserId",
      }),
      z.instanceof(Types.ObjectId),
    ])
    .transform((val) => (typeof val === "string" ? new Types.ObjectId(val) : val)),

  toUserId: z
    .union([
      z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid ObjectId for toUserId",
      }),
      z.instanceof(Types.ObjectId),
    ])
    .transform((val) => (typeof val === "string" ? new Types.ObjectId(val) : val)),

  status: z.enum(["interested", "ignored", "accepted", "rejected"], {
    errorMap: () => ({ message: "Invalid status type" }),
  }),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type connectionType = z.infer<typeof connectionSchema>;
export type connectionTypeWithId = connectionType & { _id: Types.ObjectId };
