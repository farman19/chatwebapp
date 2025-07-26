import { useEffect } from 'react';
import axios from "axios";
import { useDispatch } from "react-redux";
import { setOtherUsers } from '../redux/userSlice';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ✅ Define and export outside the hook
export const fetchOtherUsers = async (dispatch) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/user/`, {
      withCredentials: true,
    });
    dispatch(setOtherUsers(res.data));
  } catch (error) {
    console.log("❌ Fetch error", error.response?.data || error.message);
  }
};

// ✅ Custom hook (uses the function)
const useGetOtherUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    fetchOtherUsers(dispatch); 
  }, [dispatch]);
};

export default useGetOtherUsers;
