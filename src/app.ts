import 'dotenv/config'
import express,{ Express,Request,Response,NextFunction} from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import compression from 'compression'
import connectDB from './config/connectDB'
import { User } from './models/user'
import { errorUtil } from 'zod/lib/helpers/errorUtil'

const app:Express=express();
const PORT:number=5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

app.get('/test', async (req:Request,res:Response)=>{
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