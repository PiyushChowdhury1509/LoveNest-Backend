import mongoose, { Document, Types } from "mongoose";

interface connectionSchemaType extends Document {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  status: string;
}

const connectionSchema = new mongoose.Schema<connectionSchemaType>(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
      required: true,
    },
  },
  { timestamps: true }
);

connectionSchema.index({fromUserId: 1,toUserId: 1});

connectionSchema.pre('save', function(next){
    const newConnection = this;
    if(newConnection.fromUserId.toString()===newConnection.toUserId.toString()){
        const error = new Error('invalid request, cant send connection to oneself');
        return next(error);
    }
    next()
})

export const Connection = mongoose.model("Connection", connectionSchema);