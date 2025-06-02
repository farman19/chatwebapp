import React, { useState } from "react";
import './registerpage.css'
import { Link, useNavigate, } from "react-router-dom";
import axios  from 'axios'
import { toast } from "react-toastify";



const RegisterPage = () => {

    const navigate = useNavigate();

  const [user, setUser] = useState({
    fullname:'',
    username:'',
    password:'',
    confirmPassword:'',
    gender:""
  })

 const handleCheckbox = (gender)=>{
    setUser({...user,gender})
 }
  

  const handleRegisterForm =  async (e) => {
    e.preventDefault();


    
    // console.log("====================",user)
   

     try {
    
      const response = await axios.post('http://localhost:8070/api/v1/user/register', user, {

        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      console.log("=========================>>>>>>",response)
      if (response) {
        navigate('/loginpage')
        toast.success(response.data.message)
        console.log('user sign-up')
        
      }

      else{
        console.log('user not sign-up')
      }
          
     } catch (error) {
      toast.error(error.response?.data?.message);
       console.log('post data error ========>' )
     }
      setUser({
        fullname:'',
        username:'',
        password:'',
        confirmPassword:'',
        gender:"",
    })

  }
  return (
        <>

      <div className="register-section">
        <div className='form-header'>
          <h2>Register</h2>
          <form onSubmit={handleRegisterForm}>
            <input type='text'  value={user.fullname} onChange={(e) => setUser({...user,fullname:e.target.value})} placeholder='Full Name' />
            <input type='text'  value={user.username} onChange={(e) => setUser({...user,username:e.target.value})} placeholder='User Name' />
            <input type="password"  value={user.password} onChange={(e) => setUser({...user,password:e.target.value})} placeholder="Password" />
            <input type="password"  value={user.confirmPassword} onChange={(e) => setUser({...user,confirmPassword:e.target.value})} placeholder="Confirem Password" />
            <div className="genders">
                Male: <input checked={user.gender === "male"    } onChange={()=>handleCheckbox("male")} type="radio" />
                Female: <input checked={user.gender === "female"    } onChange={()=>handleCheckbox("female")}  type="radio" />
            </div>
            <button type='submit' >Register</button>
            <p>Already registered <Link to='/loginpage'>login</Link></p>
            </form>
        </div>
        </div>
      </>
      )
}
      export default RegisterPage;