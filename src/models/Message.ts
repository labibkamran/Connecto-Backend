// src/models/Message.ts
import { Schema, model, Document, Types } from "mongoose";

export type MessageStatus = "sent" | "delivered" | "read";

export interface IMessage extends Document {
  roomId: Types.ObjectId;      
  senderId: Types.ObjectId;   
  content: string;
  status: MessageStatus;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

messageSchema.index({ roomId: 1, createdAt: 1 });

export const Message = model<IMessage>("Message", messageSchema);
