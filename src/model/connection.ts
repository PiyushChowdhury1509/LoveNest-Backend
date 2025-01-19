import mongoose,{ Document, Types } from 'mongoose';

interface connectionSchemaType extends Document{
    fromUserId: Types.ObjectId,
    toUserId: Types.ObjectId,
    status: string
}

const connectionSchema = new mongoose.Schema<connectionSchemaType>({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ["interested","ignored","accepted","rejected"],
            message: `{VALUE} is incorrect status type`,
        },
        required: true
    }
}, { timestamps: true });

export const Connection = mongoose.model('Connection',connectionSchema);