

import { User } from "../models/usermodel.js";


// 🔗 Send Friend Request
export const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        console.log("👉 Sender ID:", senderId);
        console.log("👉 Receiver ID:", receiverId);

        // ✅ खुद को रिक्वेस्ट नहीं कर सकते
        if (senderId.toString() === receiverId) {
            return res.status(400).json({ message: "You cannot send request to yourself." });
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        // ✅ Receiver exists check
        if (!receiver) {
            return res.status(404).json({ message: "Receiver user not found" });
        }

        // ✅ Check if already friends
        const alreadyFriends = sender.friends.includes(receiverId);
        if (alreadyFriends) {
            return res.status(400).json({ message: "You are already friends." });
        }

        // ✅ Check if request already sent
        const requestAlreadySent = sender.sentRequests.includes(receiverId);
        const requestAlreadyReceived = receiver.friendRequests.includes(senderId);

        if (requestAlreadySent || requestAlreadyReceived) {
            return res.status(400).json({ message: "Friend request already sent." });
        }

        // ✅ Add to sentRequests and friendRequests
        sender.sentRequests.push(receiverId);
        receiver.friendRequests.push(senderId);

        await sender.save();
        await receiver.save();

        console.log(`✅ Friend request sent from ${sender.username} to ${receiver.username}`);

        return res.status(200).json({ message: "Friend request sent successfully." });

    } catch (error) {
        console.error("❌ Friend request error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// get sentRequests 

export const getSentRequests = async (req, res) => {
    try {
        const user = await User.findById(req.id).populate('sentRequests', 'fullname profilePhoto');

        res.status(200).json({
            sentRequests: user.sentRequests
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// get friend request 
// 🔗 Get Friend Requests
// ✅ Get Friend Requests API (Fixed)
export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.id;
        console.log("👉 User ID from token:", userId);

        const userWithoutPopulate = await User.findById(userId);
        console.log("👉 Friend Request IDs (Without Populate):", userWithoutPopulate.friendRequests);

        const user = await User.findById(userId).populate(
            "friendRequests",
            "fullname username profilePhoto"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        console.log("👉 Friend Requests Populated:", user.friendRequests);

        res.status(200).json({
            friendRequests: user.friendRequests,
        });

    } catch (error) {
        console.error("❌ Error in getFriendRequests:", error);
        res.status(500).json({ message: "Server error." });
    }
};
// ❌ Cancel Friend Request is work
 export const cancelFriendRequest = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId);
    receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== senderId);

    await sender.save();
    await receiver.save();

    return res.status(200).json({ message: "Friend request cancelled successfully" });
  } catch (error) {
    console.log("Cancel request error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



// ✅ Accept Friend Request is work
export const acceptFriendRequest = async (req, res) => {
    const receiverId = req.id;
    const senderId = req.params.id;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver.friendRequests.includes(senderId)) {
        return res.status(400).json({ message: "No request from this user." });
    }

    receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== senderId.toString());
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId.toString());

    receiver.friends.push(senderId);
    sender.friends.push(receiverId);

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Friend request accepted." });
};

// become friend is work

export const getFriends = async (req, res) => {
  try {
    const userId = req.id;

    const user = await User.findById(userId).populate(
      "friends",
      "fullname username profilePhoto"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      friends: user.friends,
    });

  } catch (error) {
    console.error("❌ Error in getFriends:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// 🔥 Delete (Reject) Friend Request
export const deleteFriendRequest = async (req, res) => {
  try {
    const receiverId = req.id;           // ✅ Current logged-in user (Receiver)
    const senderId = req.params.id;      // ✅ User who sent the request

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Check if request exists
    const requestExists = receiver.friendRequests.includes(senderId);
    if (!requestExists) {
      return res.status(400).json({ message: "No friend request from this user" });
    }

    // ✅ Remove from friendRequests (Receiver's side)
    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== senderId
    );

    // ✅ Also remove from sentRequests (Sender's side)
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== receiverId
    );

    await receiver.save();
    await sender.save();

    return res.status(200).json({ message: "Friend request deleted (rejected) successfully" });

  } catch (error) {
    console.error("❌ Error in deleteFriendRequest:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// 🔥 Remove Friend
 export  const unfriendUser = async (req, res) => {
  const userId = req.id;
   const friendId = req.params.id;
  console.log("---->frindId --->>",friendId)

  try {
    // दोनों की फ्रेंड लिस्ट से हटाओ
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    res.status(200).json({ message: "Unfriended successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
