import express from "express";
import { getMessage, sendMessage , deleteChatWithUser } from "../controllers/messgecontroller.js";
import isAuthenticated from "../middleware/authenticate.js";
import { upload } from "../multer/upfiles.js";

const router = express.Router();
router.route("/send/:id").post(isAuthenticated, upload.array('files'), sendMessage);
router.get("/:senderId/:receiverId", isAuthenticated, getMessage);
router.delete("/chat/:userId", isAuthenticated, deleteChatWithUser);


export default router;
