// import logo from './logo.svg';
import React,  { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './App.css';
import ChatPage from "./chatpage/chatpage";
import LoginPage from './loginpage/loginpage';
import RegisterPage from './registerpage/registerpage';
import { useDispatch, useSelector } from 'react-redux';

import { io } from 'socket.io-client'
import { setOnlineUsers } from './redux/userSlice';
import { setSocket } from './redux/socketSlice';

import ProtectedRoute from './components/protectedroute/protectroute';
import GuestRoute from './components/guestroute/guestroute';
import NewUserList from './pages/newuserlist/newuserlist';
const BASE_URL = process.env.REACT_APP_API_BASE_URL


function App() {

const dispatch = useDispatch();
  const { authUser } = useSelector(store => store.user)

  // console.log("authUser in App.jsx ===>", authUser);
  const { socket } = useSelector(store => store.socket)

useEffect(() => {
  
  if (!authUser || socket) return;


  const newSocket = io(BASE_URL, {
    auth: { token: localStorage.getItem("accessToken") },
    withCredentials: true,
    transports: ["websocket"],
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  dispatch(setSocket(newSocket));   // slice में रख दो

  /** ---- listeners ---- **/
  newSocket.on("connect", () => {
    // console.log("✅ Socket connected:", newSocket.id);
  });

  newSocket.on("connect_error", (err) => {
    // console.error("❌ connect_error:", err.message);

    // 3️⃣ token invalid हुआ तो user को logout कर दो
    if (err.message.includes("Invalid token")) {
      localStorage.removeItem("accessToken");
      dispatch(setSocket(null));     // slice साफ
      // 👉 अपना logout action बुलाइये (example):  dispatch(logout());
    }
  });

  newSocket.on("get-online-users", (list) => {
    dispatch(setOnlineUsers(list));
  });

  /** ---- cleanup ---- **/
  return () => {
    // console.log("🛑 Disconnecting socket…");
    newSocket.disconnect();
    dispatch(setSocket(null));
  };
}, [authUser, dispatch, BASE_URL]);   // ⚠️ socket dependency हटाई गई
/* --------------------------------------------------------- */






  // Inside your router config:
  const routes = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      ),

    },
    {
      path: "/all-users",
      element: (
        <ProtectedRoute>
          <NewUserList />
        </ProtectedRoute>
      ),
    },

    {
      path: "/loginpage",
      element: (
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      ),
    },
    {
      path: "/registerpage",
      element: (
        <GuestRoute>
          <RegisterPage />
        </GuestRoute>
      ),
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);



  return (
    <div className="App">
      <RouterProvider router={routes} />
    </div>
  );
}

export default App;
