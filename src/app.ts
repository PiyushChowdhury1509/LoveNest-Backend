import 'dotenv/config'
import express,{ Express,Request,Response,NextFunction} from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import compression from 'compression'
import connectDB from './config/connectDB'
import { User } from './models/user'
import { userSchema,userType } from './schemas/user'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import hashPassword from './utils/hashPassword'
import comparePassword from './utils/comparePassword'
import cookieParser from 'cookie-parser'

const app:Express=express();
const PORT:number=5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

app.post('/signup', async (req:Request,res:Response)=>{
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

app.post('/signintest', async (req:Request,res:Response)=>{
    try{
        const signInSchema= userSchema.pick({
            email:true,
            password:true
        })
        const { email,password }= signInSchema.parse(req.body);
        const user = await User.findOne({email:email}) as userType | null;
        if(!user){
            res.status(400).json({message: "invalid credentials"});
            return;
        }
        const isPasswordCorrect= await comparePassword(password,user.password);
        if(!isPasswordCorrect){
            res.status(400).json({message:"invalid credentials"});
            return;
        }
        res.status(200).json({message:"login successfull",user:user});
        return;
    } catch(err){
        if(err instanceof z.ZodError){
            res.status(400).json({
                message: "validation failed",
                error: err.errors
            })
            return;
        }
        console.log(`something went wrong: ${err}`);
        res.status(500).json({message: `something went wrong ${err}`});
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

app.post('/signin', async (req: Request,res: Response)=>{
    try{
        const signInSchema = userSchema.pick({
            email: true,
            password: true
        })
        const { email,password } = signInSchema.parse(req.body);
        const user = await User.findOne({email}) as userType;
        if(!user){
            res.status(404).json({
                message: "Email not found",
            })
            return;
        }
        const isPasswordCorrect = comparePassword(password,user.password);
        if(!isPasswordCorrect){
            res.status(400).json({
                message: "wrong credentials"
            })
        }
        //@ts-ignore
        const token = jwt.sign({_id: user._id},process.env.JWT_SECRET);
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

app.get('/profiles', async (req: Request,res: Response)=>{
    try{
        const {token} = req.cookies;
        if(!token){
            res.status(400).json({
                message: "please login"
            })
            return;
        }
        //@ts-ignore
        const {_id}:{_id:string} = jwt.verify(token,process.env.JWT_SECRET);
        if(!_id){
            res.status(400).json({
                message: "invalid token"
            })
            return;
        }
        const user = await User.findOne({_id}) as userType;
        if(!user){
            res.status(404).json({
                message: "no user found for this token"
            })
            return;
        }
        const data:Array<userType> = await User.find();
        //@ts-ignore
        const profiles = data.filter((profile)=>profile._id !== user._id);
        res.status(200).json({message: "profiles fetching successfull",data: profiles});
    } catch(err){
        console.log(`something went wrong: ${err}`);
        res.status(500).json({message: "something went wrong"});
        return;
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