import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const TaskForm = ({ onSave }) => {
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'low', tags: [] });
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const { id } = useParams();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:3001/tags', { headers: { Authorization: `Bearer ${token}` } });
        setTags(response.data);
      } catch (err) {
        setError('Failed to fetch tags.');
        console.error('Error fetching tags:', err);
      }
    };

    fetchTags();
  }, [token]);

  useEffect(() => {
    const fetchTask = async () => {
      if (id) {
        try {
          const response = await axios.get(`http://localhost:3001/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setFormData({
            title: response.data.title,
            description: response.data.description,
            priority: response.data.priority,
            tags: response.data.tags || []
          });
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch task.');
          console.error('Error fetching task:', err);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTagChange = (e) => {
    const { options } = e.target;
    const selectedTags = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setFormData({ ...formData, tags: selectedTags });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:3001/tasks/${id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('http://localhost:3001/tasks', formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      onSave();
    } catch (err) {
      setError('Failed to save task.');
      console.error('Error saving task:', err);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>{id ? 'Edit Task' : 'Create Task'}</h2>
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
        <select
          multiple
          name="tags"
          value={formData.tags}
          onChange={handleTagChange}
        >
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
        <button type="submit">{id ? 'Update' : 'Create'} Task</button>
      </form>
    </div>
  );
};

export default TaskForm;