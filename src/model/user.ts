import mongoose from 'mongoose'
import { isValidPhoneNumber } from 'libphonenumber-js';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Document } from 'mongoose';

interface User extends Document {
  firstName: string;
  lastName: string;
  email: string;
  gender: string,
  age: number,
  phoneNumber:string,
  about: string,
  profilePhotoUrl: string,
  password: string;
  getJwt(): string; 
}

const userSchema = new mongoose.Schema<User>({
    firstName: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 255
    },
    lastName: {
        type: String,
        maxLength: 255
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ['male','female','others'],
        required: true
    },
    age: {
        type: Number,
        min: 18,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        validate(value: string){
            if(!isValidPhoneNumber(value)){
                throw new Error('invalid phone number');
            }
        }
    },
    about: {
        type: String,
        maxLength: 1000
    },
    profilePhotoUrl: {
        type: String,
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    }
}, { timestamps: true });

userSchema.methods.getJwt = function(){
    const thisuser = this;
    const token = jwt.sign({_id: thisuser._id as JwtPayload},process.env.JWT_SECRET!,{
        expiresIn: '7d'
    });
    return token;
}

export const User = mongoose.model('User',userSchema);