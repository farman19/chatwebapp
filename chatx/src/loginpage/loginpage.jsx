import React, { useState, useEffect } from "react";
import './loginpage.css'
import { Link, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch ,useSelector} from "react-redux";


import { setAuthUser, setOnlineUsers } from '../redux/userSlice';
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { addNewMessage } from "../redux/messageSlice";

const BASE_URL = process.env.REACT_APP_API_BASE_URL



const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const socket = useSelector((state) => state.socket.socket);
    const [showPassword, setShowPassword] = useState(false);

    const [user, setUser] = useState({
        username: '',
        password: '',
    });

   const handleLoginForm = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(`${BASE_URL}/api/v1/user/login`, user, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });

    const { token, ...loggedInUser } = response.data;

    if (token) {
      localStorage.setItem("accessToken", token);
    }

    dispatch(setAuthUser({ ...loggedInUser, token }));

    // ✅ 🔽 Login के तुरंत बाद unseen messages लाएं
    axios
      .get(`${BASE_URL}/api/v1/message/unseen/${loggedInUser._id}`, {
        withCredentials: true,
      })
      .then((res) => {
        const unseenMessages = res.data.messages || [];

        // 1️⃣ Redux में messages add करें
        unseenMessages.forEach((msg) => {
          dispatch(addNewMessage({ message: msg, authUserId: loggedInUser._id }));
        });

        // 2️⃣ 🔔 Ringtone बजाएं अगर message मिला हो
        if (unseenMessages.length > 0) {
          const audio = new Audio("/ring/recive.wav");
          audio.play().catch((err) => {
            console.warn("🔇 Auto-play blocked:", err.message);
          });
        }

        // 3️⃣ 🔄 Seen update करें socket के ज़रिए
        const messageIds = unseenMessages.map((msg) => msg._id);
        if (socket && socket.connected && messageIds.length > 0) {
          socket.emit("message-seen", {
            senderId: unseenMessages[0].senderId,
            receiverId: loggedInUser._id,
            messageIds,
          });
        }
      })
      .catch((err) => {
        console.error("🔴 Unseen messages fetch failed:", err.message);
      });

    toast.success("Login Successful");

  } catch (error) {
    console.error(error);
    if (error.response?.status === 403) {
      toast.error("User already logged in on another device");
    } else {
      toast.error(error?.response?.data?.message || "Login error");
    }
    navigate("/loginpage");
  }
};

    const authUser = useSelector((state) => state.user.authUser);

    useEffect(() => {
        if (authUser) {
            navigate('/');
        }
    }, [authUser, navigate]);


    useEffect(() => {
        const handleOnlineUsers = (users) => {
            console.log("🔸 Online Users:", users);
            dispatch(setOnlineUsers(users));
        };

        if (socket) {
            socket.on("get-online-users", handleOnlineUsers);
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
                    <div className="chat-logo">
                        <div className="m-c-logo">
                            <img src="./images/fixlogo.png" alt="" />
                        </div>
                    </div>
                    <h2>"Welcome back"</h2>
                    <form onSubmit={handleLoginForm}>

                        <input type="text" value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} placeholder="User Name" />
                        <div className="password-field">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={user.password}
                                onChange={(e) => setUser({ ...user, password: e.target.value })}
                                placeholder="Password"
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowPassword(prev => !prev)}
                                style={{ cursor: 'pointer', marginLeft: "-30px" }}
                            >
                                {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                            </span>
                        </div>
                        <button type='submit' >Login</button>
                        <p> New user ? <Link to={'/registerpage'}>Create an account</Link></p>

                    </form>
                </div>
            </div>
        </>
    )
}

export default LoginPage;