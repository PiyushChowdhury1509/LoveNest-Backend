import { isValidPhoneNumber } from 'libphonenumber-js';
import { z } from 'zod';
import { Types } from 'mongoose';

export const userSchema = z.object({
    firstName: z
    .string()
    .min(1,"FirstName should be atleast 1 character long")
    .max(255,"FirstName is too long"),

    lastName: z
    .string()
    .max(255,"LastName is too long")
    .optional(),

    email: z
    .string()
    .email("Invalid Email address")
    .max(255,"Email is too long"),

    gender: z
    .enum(["male","female","others"],{
        errorMap:()=>({message: "gender must be male, female or others"}),
    }),

    age: z
    .number()
    .int("age must be an integer")
    .min(18,"user must be atleast 18 years old"),

    phoneNumber: z
    .string()
    .refine(isValidPhoneNumber,"invalid phone number"),

    about: z
    .string()
    .max(1000,"about section cant exceed 1000 characters")
    .optional(),

    profilePhotoUrl: z
    .string()
    .url("profile photo must be a valid url")
    .optional(),

    password: z
    .string()
    .min(6,"password must be atleast 6 characters long"),

    createdAt: z
    .date()
    .optional(),

    updatedAt: z
    .date()
    .optional()
}).strict()

export type userType = z.infer<typeof userSchema>;
export type userTypeWithId = userType & {_id: Types.ObjectId, getJwt():string};