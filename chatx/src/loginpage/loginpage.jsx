import React, { useState, useEffect } from "react";
import './loginpage.css'
import { Link, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";

import { useSelector } from 'react-redux';
import { setAuthUser, setOnlineUsers } from '../redux/userSlice';
import io from 'socket.io-client';
import { setSocket } from '../redux/socketSlice'

const BASE_URL = process.env.REACT_APP_API_BASE_URL



const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [user, setUser] = useState({

        username: '',
        password: '',


    })
    const socket = useSelector((state) => state.user.socket);
    // console.log("--------", socket)

    const handleLoginForm = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${BASE_URL}/user/login`, user, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            // console.log("after login data :", response.data)

            dispatch(setAuthUser(response.data));

            // ✅ socket initialize करें और userId भेजें
            const socket = io(`${BASE_URL}`, {
                query: {
                    userId: response.data._id
                },
                withCredentials: true
            });

            dispatch(setSocket(socket));

            navigate('/');
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error("User already logged in on another device");
            } else {
                toast.error(error?.response?.data?.message || "Login error");
            }
            navigate('/loginpage');
        }
    };

   useEffect(() => {
    const handleOnlineUsers = (users) => {
        console.log("Online Users received:", users);
        dispatch(setOnlineUsers(users));
    };

    if (socket) {
        socket.off("get-online-users", handleOnlineUsers); // 🔁 remove old
        socket.on("get-online-users", handleOnlineUsers);   // ➕ add new
    }

    return () => {
        if (socket) {
            socket.off("get-online-users", handleOnlineUsers);
        }
    };
}, [socket, dispatch]);



    return (
        <>
            <div className="login-section">
                <div className="login-header">
                    <h2>Login</h2>
                    <form onSubmit={handleLoginForm}>

                        <input type="text" value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} placeholder="User Name" />
                        <input type="password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} placeholder="Password" />
                        <button type='submit' >Login</button>
                        <p>New user <Link to={'/registerpage'}>Register Here</Link></p>

                    </form>
                </div>
            </div>
        </>
    )
}

export default LoginPage;