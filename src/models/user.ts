import mongoose from 'mongoose'
import { isValidPhoneNumber } from 'libphonenumber-js';

const userSchema = new mongoose.Schema({
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
        type: String
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

export const User = mongoose.model('User',userSchema);