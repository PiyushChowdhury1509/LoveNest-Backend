import mongoose from 'mongoose';

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("database successfully connected");
    } catch(err){
        const error=err as Error;
        console.log(`database connection failed`);
    }
}

export default connectDB;