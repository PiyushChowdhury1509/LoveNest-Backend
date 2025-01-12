import 'dotenv/config'
import express,{ Express,Request,Response,NextFunction} from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import compression from 'compression'
import connectDB from './config/connectDB'
import cookieParser from 'cookie-parser'

const app:Express=express();
const PORT:number=5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

import userRouter from './routes/userRoute'
import profileRouter from './routes/profileRouter'

app.use('/user',userRouter);
app.use('/profile',profileRouter);

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