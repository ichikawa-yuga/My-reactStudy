import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TagForm from './TagForm'; // TagForm をインポート

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [showTagForm, setShowTagForm] = useState(false); // タグ追加フォームの表示制御
  const [sorted, setSorted] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate(); // React Router の useNavigate フックを使用

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:3001/tasks', {
          headers: { Authorization: `Bearer ${token}` },
          params: { tag_id: selectedTag }
        });
        setTasks(response.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    fetchTasks();
  }, [selectedTag, token]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:3001/tags', { headers: { Authorization: `Bearer ${token}` } });
        setTags(response.data);
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };

    fetchTags();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
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
    navigate(`/task-form/${task.id}`); // 編集画面に遷移
  };

  const handleViewDetails = (task) => {
    navigate(`/task-detail/${task.id}`); // 詳細ページに遷移
  };

  const toggleTagForm = () => {
    setShowTagForm(!showTagForm);
  };

  const handleTagAdded = () => {
    // タグが追加された後にタグリストを再取得
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:3001/tags', { headers: { Authorization: `Bearer ${token}` } });
        setTags(response.data);
      } catch (err) {
        console.error('Error fetching tags after adding a new one:', err);
      }
    };
    fetchTags();
  };

  return (
    <div>
      <h2>Task List</h2>
      <button onClick={sortTasks}>
        {sorted ? 'Sort by Default' : 'Sort by Priority'}
      </button>
      <button onClick={toggleTagForm}>
        {showTagForm ? 'Cancel' : 'Add Tag'}
      </button>
      {showTagForm && <TagForm onTagAdded={handleTagAdded} />}
      <select onChange={(e) => setSelectedTag(e.target.value)} value={selectedTag}>
        <option value="">All Tags</option>
        {tags.map(tag => (
          <option key={tag.id} value={tag.id}>{tag.name}</option>
        ))}
      </select>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Priority: {task.priority}</p>
            <button onClick={() => handleEditClick(task)}>Edit</button>
            <button onClick={() => handleDelete(task.id)}>Delete</button>
            <button onClick={() => handleViewDetails(task)}>View Details</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;