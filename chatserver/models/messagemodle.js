import mongoose from "mongoose";

const messageModel = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    message:{
        type:String,
       
    },
      fileurl: [
    {
      type: String,  // Array of strings (file URLs)
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
},{timestamps:true});
export const Message = mongoose.model("Message", messageModel);