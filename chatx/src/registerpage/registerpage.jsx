import React, { useState } from "react";
import './registerpage.css'
import { Link, useNavigate, } from "react-router-dom";
import axios from 'axios'
import { toast } from "react-toastify";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
const BASE_URL = process.env.REACT_APP_API_BASE_URL


const RegisterPage = () => {

  const navigate = useNavigate();

  const [user, setUser] = useState({
    fullname: '',
    username: '',
    password: '',
    confirmPassword: '',
    gender: ""
  })
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCheckbox = (gender) => {
    setUser({ ...user, gender })
  }


  const handleRegisterForm = async (e) => {
    e.preventDefault();



    // console.log("====================",user)


    try {

      const response = await axios.post(`${BASE_URL}/api/v1/user/register`, user, {

        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      console.log("=========================>>>>>>", response)
      if (response) {
        navigate('/loginpage')
        toast.success(response.data.message)
        console.log('user sign-up')

      }

      else {
        console.log('user not sign-up')
      }

    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log('post data error ========>')
    }
    setUser({
      fullname: '',
      username: '',
      password: '',
      confirmPassword: '',
      gender: "",
    })

  }
  return (
    <>

      <div className="register-section">
        <div className='form-header'>
          <div className="r-c-logo">
            <div className="r-m-logo">
              <img src="./images/fixlogo.png" alt="" />
            </div>
          </div>
          <h2>Welcome to ChatX,</h2>
          <form onSubmit={handleRegisterForm}>
            <input type='text' value={user.fullname} onChange={(e) => setUser({ ...user, fullname: e.target.value })} placeholder='Full Name' />
            <input type='text' value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} placeholder='User Name' />
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                placeholder="Password"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
                style={{ cursor: "pointer", marginLeft: "-30px" }}
              >
                {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              </span>
            </div>

            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={user.confirmPassword}
                onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                placeholder="Confirm Password"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="toggle-password"
                style={{ cursor: "pointer", marginLeft: "-30px" }}
              >
               {showConfirmPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              </span>
            </div>

            <div className="genders">
              Male: <input checked={user.gender === "male"} onChange={() => handleCheckbox("male")} type="radio" />
              Female: <input checked={user.gender === "female"} onChange={() => handleCheckbox("female")} type="radio" />
            </div>
            <button type='submit' >Register</button>
            <p>Already have an account? <Link to='/loginpage'>login</Link></p>
          </form>
        </div>
      </div>
    </>
  )
}
export default RegisterPage;