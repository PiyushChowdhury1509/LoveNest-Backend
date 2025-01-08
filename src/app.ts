import 'dotenv/config'
import express,{ Express,Request,Response,NextFunction} from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import compression from 'compression'
import connectDB from './config/connectDB'
import { User } from './models/user'
import { userSchema,userType } from './schemas/user'
import { z } from 'zod'

const app:Express=express();
const PORT:number=5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

app.post('/test', async (req:Request,res:Response)=>{
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

app.patch('/test', async (req:Request,res:Response)=>{
    try{
        const {email,...body}=req.body;
        if(!email){
            res.status(400).json({message: "Email should be present"});
            return;
        }
        const validatedUser=userSchema.partial().parse(body);
        const updatedUser = await User.findOneAndUpdate(
            {email:email},
            {...validatedUser},
            {new: true, runValidators: true}
        )
        if(!updatedUser){
            res.status(400).json({message: "no user found with this email id"});
            return;
        }
        res.status(200).json({message: "information updated successfully",user: updatedUser});
        return;
    } catch(err){
        if(err instanceof z.ZodError){
            res.status(400).json({
                message: "validation failed",
                error: err.errors
            })
            return
        }
        console.log(`something went wrong: ${err}`);
        res.status(500).json({message: `something went wrong: ${err}`});
        return;
    }
})

app.delete('/test', async (req:Request,res:Response)=>{
    try{
        const { email }=req.body;
        if(!email) res.status(400).json({message:"email is necessary"});
        const deletedUser=await User.deleteOne({email});
        if(!deletedUser.deletedCount) res.status(400).json({message: "no user found"});
        res.status(201).json({message:`User deleted successfully`,deletedUser:deletedUser});
    } catch(err){
        const error=err as Error;
        console.log(`something went wrong in delete route: ${error}`);
        res.status(400).json({message: `something went wrong: ${error}`});
    }
})

app.use('/',(error:Error,req:Request,res:Response,next:NextFunction)=>{
    console.log(error);
    res.status(500).json({error: `internal server error: ${error.message}`});
})

connectDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`server is listening on port ${PORT}`);
    })
})