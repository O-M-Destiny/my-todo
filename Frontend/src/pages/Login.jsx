import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from "react-router-dom";



const Login = () => {

    const [userCredential, setUserCredentials] = useState({email: "", password: ""})
    const {login} = useAuth()
    const navigate = useNavigate()

    const handleChange = (e)=> {
        const {name, value} = e.target;
        setUserCredentials((prev) => ({
            ...prev, [name] : value
        }))
    }

    const handleLogin =async () => {
        try{
            const response = await fetch("http://127.0.0.1:8000/login",{
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    username: userCredential.email,
                    password: userCredential.password
                })})
            const data = await response.json()
            if(response.ok){
                login(data)
                navigate("/dashboard")

            }else{
                alert("Error" + data.detail)
            }
        }catch(error){

        }
    }

  return (
    <div className='login-container'>
        <div className='login-form'>
            <h1 style={{marginBottom:"10px", fontWeight:"300"}}>Login</h1>
            <input type="text" name='email' placeholder='email' value={userCredential.email} onChange={handleChange} required />
            <br />
            <input type="password" name='password' placeholder='password' value={userCredential.password} onChange={handleChange} required />
            <br />
            <button onClick={handleLogin}>Login</button>
            <p style={{marginTop:"10px"}}>Don't Have an account? <Link style={{color:"blue", textDecoration:"None"}} to={"/register"}>Sign up</Link></p>
        </div>
        <br />
        
    </div>
    
  )
}

export default Login