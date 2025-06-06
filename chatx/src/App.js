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



function App() {
  

const {authUser} = useSelector(store=>store.user)
const {socket}=useSelector(store=>store.socket)
 
   const dispatch =useDispatch();
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
