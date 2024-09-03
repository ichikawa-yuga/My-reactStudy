import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskForm = ({ task, onSave }) => {
    const [formData, setFormData] = useState({ title: '', description: '', priority: 'low' });
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (task) {
            setFormData({ title: task.title, description: task.description, priority: task.priority });
        }
    }, [task]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (task) {
                await axios.put(`http://localhost:3001/tasks/${task.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post('http://localhost:3001/tasks', formData, { headers: { Authorization: `Bearer ${token}` } });
            }
            onSave();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>{task ? 'Edit Task' : 'Create Task'}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Title"
                    required
                />
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                />
                <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <button type="submit">Save</button>
            </form>
        </div>
    );
};

export default TaskForm;