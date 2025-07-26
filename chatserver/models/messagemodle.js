import mongoose from "mongoose";

const messageModel = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: {
    type: String
  },
  fileurl: [
    {
      type: String // Array of file URLs
    }
  ],
  isSeen: {
    type: Boolean,
    default: false
  },
  seenTime: {
    type: Date, // 🆕 Timestamp when message was seen
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

export const Message = mongoose.model("Message", messageModel);
