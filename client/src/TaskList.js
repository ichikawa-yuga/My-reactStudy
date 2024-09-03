import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskList = ({ onEdit }) => {
    const [tasks, setTasks] = useState([]);
    const [sorted, setSorted] = useState(false);
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

    const sortTasks = () => {
        setSorted(!sorted);
        setTasks(prevTasks =>
            [...prevTasks].sort((a, b) => {
                const priorities = { 'high': 3, 'medium': 2, 'low': 1 };
                return sorted ? priorities[b.priority] - priorities[a.priority] : priorities[a.priority] - priorities[b.priority];
            })
        );
    };

    const handleEditClick = (task) => {
        console.log('Editing task:', task);
        if (typeof onEdit === 'function') {
            onEdit(task);
        } else {
            console.error('onEdit is not a function');
        }
    };

    return (
        <div>
            <h2>Task List</h2>
            <button onClick={sortTasks}>
                {sorted ? 'Sort by Default' : 'Sort by Priority'}
            </button>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <p>Priority: {task.priority}</p>
                        <button onClick={() => handleEditClick(task)}>Edit</button>
                        <button onClick={() => handleDelete(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;