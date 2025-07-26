// hooks/useGetSentRequests.js
import axios from "axios";
import { setSentRequests } from "../redux/friendSlice";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const fetchSentRequests = async (dispatch) => {
  try {
    const token = localStorage.getItem('accessToken');

    const res = await axios.get(`${BASE_URL}/api/v1/friend/get-sent-requests`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });

    const ids = res.data.sentRequests.map((u) => u._id);
    dispatch(setSentRequests(ids));
  } catch (error) {
    console.error("❌ Failed to fetch sent requests", error);
  }
};

export default fetchSentRequests;
