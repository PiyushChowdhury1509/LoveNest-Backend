import express, { Router,Request,Response } from 'express';
import { userSchema, userTypeWithId } from '../schema/user';
import { User } from '../model/user';
import hashPassword from '../utils/hashPassword';
import { z } from 'zod';
import comparePassword from '../utils/comparePassword';

const userRouter:Router = express.Router();

//signup user route
userRouter.post('/signup', async (req:Request,res:Response)=>{
    try{
        const body=req.body;
        const result=userSchema.safeParse(body);
        console.log(result);
        if(!result.success){
            const errorMessages=result.error.errors.map((err)=>({
                field: err.path.join("."),
                message: err.message
            }))
            res.status(400).json({message: "validation failed",error: errorMessages})
            return;
        }
        const validatedUser=result.data;
        const hashedPassword= await hashPassword(validatedUser.password);
        validatedUser.password=hashedPassword as string;
        const newUser=new User(validatedUser);
        await newUser.save();
        res.status(201).json({message:"Registration successfull",user: newUser});
        return;
    } catch(err){
        const error=err as Error;
        console.log(`Something went wrong ${error}`);
        res.status(500).json({message: 'something went wrong',error: error});
        return;
    }
})

//signin user route
userRouter.post('/signin', async (req: Request,res: Response)=>{
    try{
        const signInSchema = userSchema.pick({
            email: true,
            password: true
        })
        const { email,password } = signInSchema.parse(req.body);
        const user = await User.findOne({email}) as userTypeWithId;
        if(!user){
            res.status(404).json({
                message: "Email not found",
            })
            return;
        }
        const isPasswordCorrect = await comparePassword(password,user.password);
        if(!isPasswordCorrect){
            res.status(400).json({
                message: "wrong credentials"
            })
        }
        const token = user.getJwt();
        res.cookie('token',token);
        res.status(200).json({
            message:"signin successfull",
            user: user
        })
        return;

    } catch(err){
        if(err instanceof z.ZodError){
            res.status(400).json({
                message: "invalid credentials",
                error: err.errors
            })
            return;
        }
        console.log(`something went wrong: ${err}`);
        res.status(500).json({message: "something went wrong",error: err});
        return;
    }
})

//logout user route
userRouter.post('/logout',(req: Request,res:Response)=>{
    try{
        res.cookie('token',null,{
            expires: new Date(0)
        })
        res.status(200).json({
            message: "logout successfull"
        })
        return;
    } catch(err){
        console.log(`something went wrong: ${err}`);
        res.status(500).json({
            message: "internal server error"
        })
        return;
    }
})

//delete user route
userRouter.delete('/deleteUser', async (req:Request,res:Response)=>{
    try{
        const deleteSchema=userSchema.pick({
            email:true
        });
        const { email }=deleteSchema.parse(req.body); 
        const deletedUser= await User.findOneAndDelete({email});
        if(!deletedUser){
            res.status(404).json({message:"user doesnt exist"});
            return;
        }
        res.status(200).json({message:"user deleted sucessfully",user:deletedUser});
    } catch(err){
        if(err instanceof z.ZodError){
            res.status(400).json({message: "invalid delete request",error:err.errors});
            return;
        }
        res.status(500).json({message: "something went wrong",error:err});
        return;
    }
})


export default userRouter; 