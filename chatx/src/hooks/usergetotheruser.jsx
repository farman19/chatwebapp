import React, { useEffect } from 'react';
import axios from "axios";
import { useDispatch } from "react-redux";
import { setOtherUsers } from '../redux/userSlice';


const useGetOtherUsers = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchOtherUsers = async () => {
            try {
                axios.defaults.withCredentials = true;
                const res = axios.get("https://chatx-xilj.onrender.com/api/v1/user/", {
                    withCredentials: true
                });
                console.log("✅ User data fetched:", res.data);
                dispatch(setOtherUsers(res.data));
            } catch (error) {
                console.log("❌ Fetch error", error.response?.data || error.message);
            }
        };
        fetchOtherUsers();
    }, []);

}

export default useGetOtherUsers