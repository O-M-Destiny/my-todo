import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {

    const navigate = useNavigate()

  return (
    <div className='Home-page'>
        <div className='headers'>
            <h1>My Todo App </h1>
            <p>Organize your day, one task at a time</p>

            <div className='buttons'>
                <button onClick={()=>navigate("/register")} className='btn'>Sign up</button>
                <button onClick={()=>navigate("/login")} className='btn'>Login</button>
            </div>
        </div>

        
        
    </div>
  )
}

export default Home