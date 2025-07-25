import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const Register = () => {

    
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const submitInfo = async (e)=> {
        e.preventDefault();
        try{
            const response = await fetch(`${BASE_URL}/register`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        hashed_password: password
                    })
                })

                const data = await response.json()
                if(response.ok){
                    setEmail("")
                    setUsername("")
                    setPassword("")
                    navigate("/login")
                    
                }else{
                    console.log(data)
                    // alert(data.detail || "Registration failed")
                }
        }catch(error) {
            alert("Error " +error)
        }
    }

  return (
    <div className='reg-container'>
        <form className='reg-form'>
            <h1 style={{marginBottom:"10px", fontWeight: "300"}}>Register</h1>
        <input 
            type="text" 
            placeholder='Username'
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            required
        />
        <br />
        <input 
            type="email" 
            placeholder='Email'
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
        />
        <br />

        <input 
            type="password" 
            placeholder='Password'
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required 
        
        />

       
        <div><button type='submit' onClick={(e) => submitInfo(e)}>Submit</button></div>
        <p style={{marginTop:"10px"}}>Already have an account? <Link style={{color:"blue", textDecoration:"None"}} to={"/login"}>Login</Link></p>
    </form>
    </div>
    
  )
}

export default Register