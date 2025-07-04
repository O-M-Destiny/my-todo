import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route index element={<Home/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register/>} />
        <Route path='/login' element={<Login/>}/>
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;
