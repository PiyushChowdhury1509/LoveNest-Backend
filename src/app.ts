import 'dotenv/config'
import express,{ Express,Request,Response,NextFunction} from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import compression from 'compression'
import connectDB from './config/connectDB'
import { User } from './models/user'

const app:Express=express();
const PORT:number=5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

app.post('/test', async (req:Request,res:Response)=>{
    try{
        const body=req.body;
        const newUser=new User(body);
        await newUser.save();
        res.status(201).json({message: "user created successfully", user: newUser});
    } catch(err){
        const error=err as Error;
        console.log(`Something went wrong ${error}`);
        res.status(500).json({message: 'something went wrong',error: error.message});
    }
})

app.patch('/test', async (req: Request,res:Response)=>{
    try{
        const { email,...body } = req.body;
        if(!email) res.status(400).json({message: "email isnt there"});
        const updatedUser = await User.findOneAndUpdate(
            {email:email},
            {...body},
            {new: true,runValidators:true}
        )
        if(!updatedUser) res.status(400).json({message: "no user found"});
        res.status(200).json({message:"user updated successfully",data:updatedUser});
    } catch(err){
        const error=err as Error;
        console.log(`an error occurred: ${error}`);
        res.status(500).json({message: `an error occurred: ${error}`});
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