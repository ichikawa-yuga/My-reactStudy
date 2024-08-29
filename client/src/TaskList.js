import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskList = ({ onEdit }) => {
    const [tasks, setTasks] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:3001/tasks', { headers: { Authorization: `Bearer ${token}` } });
                setTasks(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchTasks();
    }, [token]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setTasks(tasks.filter(task => task.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Task List</h2>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <button onClick={() => onEdit(task)}>Edit</button>
                        <button onClick={() => handleDelete(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;