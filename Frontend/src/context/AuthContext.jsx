import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("authUser");
    return saved ? JSON.parse(saved) : null;
  });

    const login =(userData) => {
        setUser(userData)
        localStorage.setItem("authUser", JSON.stringify(userData));
    }

  return (
    <AuthContext.Provider value={{user, login}}>
        {children}
    </AuthContext.Provider>
  )
}


export const useAuth = () => useContext(AuthContext);
export default AuthContext