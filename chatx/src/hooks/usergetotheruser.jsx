import { useEffect } from 'react';
import axios from "axios";
import { useDispatch } from "react-redux";
import { setOtherUsers } from '../redux/userSlice';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const useGetOtherUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOtherUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/user/`, {
          withCredentials: true
        });
        // console.log("✅ User data fetched:", res.data);
        dispatch(setOtherUsers(res.data));
      } catch (error) {
        console.log("❌ Fetch error", error.response?.data || error.message);
      }
    };

    fetchOtherUsers();
  }, [dispatch]);
};

export default useGetOtherUsers;
