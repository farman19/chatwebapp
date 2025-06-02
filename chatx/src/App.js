// import logo from './logo.svg';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
  if (authUser) {
    const socket = io('https://chatx-xilj.onrender.com', {
        query:{
          userId:authUser._id
        },
        withCredentials: true

    
    });
    dispatch(setSocket(socket));
    socket.on('get-online-users',(onlineUsers)=>{
      dispatch(setOnlineUsers(onlineUsers))
    });
    return ()=> socket.close();
  }
   else{
    if(socket){
      socket.close();
      dispatch(setSocket(null))
    }
   }
} ,[authUser?._id]);
    

   
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
