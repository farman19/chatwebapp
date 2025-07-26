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
  //  const fileUrls = req.files?.map(file => `http://localhost:8070/uploads/${file.filename}`) || [];
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
console.log("📡 Getting socket for receiverId:", receiverId);

    const receiverIdsocketId = getReceiverSocketId(receiverId);
    console.log("📬 Socket ID found:", receiverIdsocketId);
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

    // 1️⃣ Validate + cast ObjectId
    if (!mongoose.Types.ObjectId.isValid(senderId) ||
        !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: "Invalid sender or receiver ID." });
    }

    const sid = new mongoose.Types.ObjectId(senderId);
    const rid = new mongoose.Types.ObjectId(receiverId);

    // 2️⃣ Conversation खोजो
    let conversation = await Conversation.findOne({
      participants: { $all: [sid, rid] },
    }).populate("messages");

    // 3️⃣ अगर नहीं मिला तो भी 200 + empty array
    if (!conversation) {
      // 👉 optional: auto‑create empty conversation
      // conversation = await Conversation.create({ participants: [sid, rid], messages: [] });

      return res.status(200).json({ messages: [] });
    }

    // 4️⃣ मिला तो messages भेज दो
    return res.status(200).json({ messages: conversation.messages || [] });
  } catch (error) {
    console.error("🔴 Error in getMessage:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteChatWithUser = async (req, res) => {
  const currentUserId = req.id;
  const otherUserId = req.params.userId;

  try {
    const deleted = await Message.deleteMany({
      $or: [
        {
          senderId: new mongoose.Types.ObjectId(currentUserId),
          receiverId: new mongoose.Types.ObjectId(otherUserId),
        },
        {
          senderId: new mongoose.Types.ObjectId(otherUserId),
          receiverId: new mongoose.Types.ObjectId(currentUserId),
        },
      ],
    });

    console.log("Deleted Count:", deleted.deletedCount);
    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Deletion error:", err);
    res.status(500).json({ message: "Failed to delete chat" });
  }
};
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { senderId, receiverId, messageIds } = req.body;

    if (!senderId || !receiverId || !Array.isArray(messageIds)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const now = new Date(); // 📅 Current timestamp

    const result = await Message.updateMany(
      {
        _id: { $in: messageIds },
        senderId,
        receiverId,
        isSeen: false,
      },
      {
        $set: {
          isSeen: true,
          seenTime: now // ✅ Add this line
        }
      }
    );

    console.log("📦 DB update result:", result);

    const senderSocketId = getReceiverSocketId(senderId);
    console.log("📡 Sender Socket ID:", senderSocketId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("message-seen-update", {
        userId: receiverId,           // Who saw the messages
        messageIds,
        seenTime: now.toISOString()   // ⏱️ Optional: pass timestamp to client
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error marking messages as seen:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUnseenMessagesForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const unseenMessages = await Message.find({
      receiverId: userId,
      isSeen: false
    }).sort({ createdAt: 1 }); // 🔽 पुराना पहले

    return res.status(200).json({ messages: unseenMessages });
  } catch (error) {
    console.error("❌ Error fetching unseen messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};

