import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [newTodo, setNewTodo] = useState("");

  const[description, setDescription] = useState("")

  // ✅ Move fetchTodos here so it can be reused
  const fetchTodos = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/get_todo?skip=0&limit=100', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      const username = await fetch("http://127.0.0.1:8000/username", {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      const usernameData = await username.json();
      if (username.ok) {
        setProfileName(usernameData);
      } else {
        console.error('Error fetching username:', usernameData.detail);
      }

      const data = await response.json();
      if (response.ok) {
        setTodos(data);
      } else {
        console.error('Error fetching todos:', data.detail);
      }
    } catch (error) {
      console.error('Network error fetching todos:', error);
    }
  };

  useEffect(() => {
    if (!user || !user.access_token) {
      navigate('/');
      return;
    }
    fetchTodos();
  }, [user, navigate]);

  const handleChange = (e) => {
    setNewTodo(e.target.value);
    
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value)
  }

  const AddTodo = async () => {
    const trimmed = newTodo.trim();
    if (!trimmed) return;

    try {
      const adding_todo = await fetch("http://127.0.0.1:8000/Add_Todo", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.access_token}`
        },
        body: JSON.stringify({
          title: trimmed,
          description: description,     // default value
          completed: false     // default value
        })
      });

      const taskData = await adding_todo.json();

      if (adding_todo.ok) {
        setNewTodo("");
        setDescription("")
        fetchTodos(); // ✅ Refresh the list after successful post
      } else {
        alert(taskData.detail);
        console.error(taskData.detail);
      }
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const handleCheckboxChange = async(id, currentStatus, title, description) => {
    
    const response = await fetch (`http://127.0.0.1:8000/edit_todo/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`
        },
        body: JSON.stringify({
          title: title,
          description: description,
          completed: !currentStatus
        })
      }
    )

    const data = await response.json()
    if(response.ok){
      fetchTodos()
    }else{
      console.log("Error: ", data.message || data.detail)
    }

  }

  const DeleteTodo = async(id, title) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${title}`)
    if(!confirmDelete) return

    try{
      const response = await fetch(`http://127.0.0.1:8000/delete_todo/${id}`,{
        method: "DELETE",
        headers: {
          "Content-Type" : "application/json",
          Authorization: `Bearer ${user.access_token}`
        }
      })

      const data = response.json()
      if(response.ok) {
        fetchTodos()
      }else{
        alert("Unknown error")
      }
    }catch(error){
      alert(`Error ${error}`)
    }
  }

  return (
    <div className="dashboard">
      <div className='inner-dashboard'>
        <h2>Todo List</h2>

        <p className='welcome-user'>
          Welcome {profileName}, your tasks are listed below:
        </p>

        <div className='add-task'>
          <input
            type="text"
            placeholder='Enter todo'
            value={newTodo}
            onChange={handleChange}
          />
          
          <button type='submit' onClick={AddTodo}>Add</button>

         <div><input 
              style={{opacity: newTodo.trim().length >= 2 ?  1 : 0}} 
              className='add-desc' 
              type="text" 
              placeholder='Description (Optional)'
              value={description}
              onChange={handleDescriptionChange}
         />
         </div>
          
        </div>
        

        

        {todos.length === 0 ? (
  <p style={{ color: "red" }}>No tasks found.</p>
) : (
  <ul style={{ listStyle: "none", padding: 0 }}>
    {[...todos].reverse().map((todo) => (
      <li
        key={todo.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "15px",
         
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() =>
            handleCheckboxChange(
              todo.id,
              todo.completed,
              todo.title,
              todo.description
            )
          }
        />
        <strong
          style={{
            textDecoration: todo.completed ? "line-through" : "none",
            flexGrow: 1, // This makes the title take up space and push ❌ to the right
          }}
        >
          {todo.title}
        </strong>
        <strong>
          {todo.description}
        </strong>
        
        <button 
        onClick={()=>DeleteTodo(todo.id, todo.title)}
        style={{ background: "transparent", border: "none", cursor: "pointer" }}>❌</button>
          </li> ))}
   </ul>
        )}

       
      </div>
    </div>
  );
};

export default Dashboard;
