// src/routes/PrivateRoute.jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  // If no user is logged in, redirect to /login
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
