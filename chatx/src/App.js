// import logo from './logo.svg';
import { createBrowserRouter, RouterProvider,Navigate } from 'react-router-dom';
import './App.css';
import ChatPage from "./chatpage/chatpage";
import LoginPage from './loginpage/loginpage';
import RegisterPage from './registerpage/registerpage';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {io} from 'socket.io-client'
import { setOnlineUsers } from './redux/userSlice';
import { setSocket } from './redux/socketSlice';
import store from './redux/store';
import ProtectedRoute from './components/protectedroute/protectroute';
import GuestRoute from './components/guestroute/guestroute';
const BASE_URL = process.env.REACT_APP_API_BASE_URL


function App() {
  

const {authUser} = useSelector(store=>store.user)
const {socket}=useSelector(store=>store.socket)
 
   const dispatch =useDispatch();
  
 useEffect(() => {
  if (!authUser || socket) return;  

  const newSocket = io(BASE_URL, {
    query: { userId: authUser?._id },
    withCredentials: true,
      reconnectionAttempts: 5,
  timeout: 10000,
   
  });

  dispatch(setSocket(newSocket));

  newSocket.on("get-online-users", (onlineUsers) => {
    dispatch(setOnlineUsers(onlineUsers));
  });

  newSocket.on('connect', () => {
    console.log('✅ Socket connected:', newSocket.id);
  });

  newSocket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });

  return () => {
  if (newSocket) {
    newSocket.disconnect();
    dispatch(setSocket(null));
  }
};
}, [authUser, dispatch]);  // ✅ socket dependency हटा दो




    

   
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
     <RouterProvider router={routes}/>
    </div>
  );
}

export default App;
