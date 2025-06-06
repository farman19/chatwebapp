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
            const response = await axios.post('https://chatx-xilj.onrender.com/api/v1/user/login', user, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            dispatch(setAuthUser(response.data));

            // ✅ socket initialize करें और userId भेजें
            const socket = io("https://chatx-xilj.onrender.com", {
                query: {
                    userId: response.data._id
                },
                withCredentials: true
            });

            dispatch(setSocket(socket)); 

            navigate('/');
        } catch (error) {
            toast.error(error?.response?.data?.message || "Login error");
        }
    }
    useEffect(() => {
        if (socket) {
            socket.on("get-online-users", (users) => {
                console.log("Online Users received:", users);
                dispatch(setOnlineUsers(users));
            });

            return () => {
                socket.off("get-online-users");
            };
        }
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