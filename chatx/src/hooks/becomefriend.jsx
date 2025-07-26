import axios from "axios";

import { setFriends } from "../redux/friendSlice";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const fetchFriends = async (dispatch) => {
  const token = localStorage.getItem("accessToken");

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/friend/get-friends`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    
    // console.log("---->--->", res.data.friends)
    dispatch(setFriends(res.data.friends));
    return res.data.friends;
  } catch (error) {
    console.error("Error fetching friends:", error);
    // toast.error(error.response?.data?.message || "Failed to fetch friends");
    return [];
  }
};

export default fetchFriends;
