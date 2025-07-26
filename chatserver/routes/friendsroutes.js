import express from "express";
const router = express.Router();
import isAuthenticated from "../middleware/authenticate.js";
import {
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    unfriendUser,
    getFriendRequests,
     getFriends,
     getSentRequests,
     deleteFriendRequest
} from '../controllers/friendcontroller.js';

router.post('/send-request/:id', isAuthenticated, sendFriendRequest);
router.post('/cancel-friend-request/:id', isAuthenticated, cancelFriendRequest);
router.post('/accept-request/:id', isAuthenticated, acceptFriendRequest);
router.post('/delete-request/:id', isAuthenticated, deleteFriendRequest);
router.post('/unfriend/:id', isAuthenticated, unfriendUser);


router.get('/get-friend-requests', isAuthenticated, getFriendRequests);
router.get('/get-friends', isAuthenticated, getFriends);
router.get('/get-sent-requests',isAuthenticated,getSentRequests)




export default  router;
