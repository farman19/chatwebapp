import axios from "axios";
import { setFriendRequests } from "../redux/friendSlice";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;


const fetchFriendRequests = async (dispatch) => {
  try {
    const token = localStorage.getItem("accessToken");

    const res = await axios.get(`${BASE_URL}/api/v1/friend/get-friend-requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    
    // console.log("friend-request-data-------->", res.data)
    dispatch(setFriendRequests(res.data.friendRequests));
  } catch (error) {
    console.error("Error fetching friend requests:", error);
  }
};


export default fetchFriendRequests;
