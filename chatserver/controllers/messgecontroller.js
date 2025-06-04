import { Conversation } from "../models/conversationmodel.js";
import { Message } from "../models/messagemodle.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import mongoose from "mongoose";
import multer from "multer";
import cloudinary from "../dbconfig/cloudinary.js";
import { upload } from "../multer/upfiles.js";


export const sendMessage = async (req, res) => {
  try {
    // Log the incoming request to see if files and message are coming correctly
    // console.log("Request Body: ", req.body);
    // console.log("Files: ", req.files);

    const senderId = req.id; 
    const receiverId = req.params.id;
    const message = req.body.message;  
   const fileUrls = req.files?.map(file => `https://chatx-xilj.onrender.com/uploads/${file.filename}`) || [];



    console.log("file", fileUrls)



    // console.log("Sender: ", senderId, "Receiver: ", receiverId, "Message: ", message, "Files: ", files);

    if (!senderId || !receiverId ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({ error: "Invalid participant IDs" });
    }

    let gotConversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!gotConversation) {
      gotConversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

 
    //  const fileUrls = req.files?.map(file => `https://chatx-xilj.onrender.com/uploads/${file.filename}`) || [];


    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      fileurl:fileUrls,
    });

    // console.log("=====",newMessage.message)

    if (newMessage) {
      gotConversation.messages.push(newMessage._id);
    }

    await Promise.all([gotConversation.save(), newMessage.save()]);

    const receiverIdsocketId = getReceiverSocketId(receiverId);
    if(receiverIdsocketId){
      io.to(receiverIdsocketId).emit('newMessage',newMessage)
    }

    return res.status(201).json({ newMessage });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




export const getMessage = async (req, res) => {
  try {
   const { senderId, receiverId } = req.params;

    // console.log("📨 Request to get messages between:", senderId, receiverId);

    // Validate receiverId and senderId
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: "Invalid or missing receiver ID." });
    }

    if (!senderId || !mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ error: "Invalid or missing sender ID." });
    }

 
    const conversation = await Conversation.findOne({
      participants:{
        $all: [
          senderId,
          receiverId,
          

        ],
      },
    }).populate("messages");

   
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // console.log("🟢 Fetched conversation:", conversation);

   
    return res.status(200).json( conversation?.messages );

  } catch (error) {
    console.error("🔴 Error in getMessage:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteChatWithUser = async (req, res) => {
  const currentUserId = req.id;
  const otherUserId = req.params.userId;

  try {
    await Message.deleteMany({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    });

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};

