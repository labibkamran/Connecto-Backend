// src/models/Room.ts
import { Schema, model, Document, Types } from "mongoose";

export type RoomType = "group" | "dm";
export type MemberRole = "admin" | "member";

export interface IRoomMember {
  user: Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
}

export interface IRoom extends Document {
  name?: string;                 
  type: RoomType;                
  members: IRoomMember[];      
  createdBy: Types.ObjectId;    
  createdAt: Date;
}

const roomMemberSchema = new Schema<IRoomMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["group", "dm"],
      required: true,
    },
    members: {
      type: [roomMemberSchema],
      validate: {
        validator: function (members: IRoomMember[]) {
          // at least 2 members in any room
          return members.length >= 2;
        },
        message: "Room must have at least 2 members",
      },
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);


roomSchema.index({ "members.user": 1 });
roomSchema.index({ type: 1, "members.user": 1 });

export const Room = model<IRoom>("Room", roomSchema);
