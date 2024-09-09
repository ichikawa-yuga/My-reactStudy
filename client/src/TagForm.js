import React, { useState } from 'react';
import axios from 'axios';
import './TagForm.css'; // CSS ファイルをインポート

const TagForm = ({ onTagAdded }) => {
  const [tagName, setTagName] = useState('');
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setTagName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/tags', { name: tagName }, { headers: { Authorization: `Bearer ${token}` } });
      setTagName('');
      onTagAdded();
    } catch (err) {
      setError('Failed to add tag.');
      console.error('Error adding tag:', err);
    }
  };

  return (
    <div className="tag-form-container">
    <h2>Add New Tag</h2>
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={tagName}
        onChange={handleChange}
        placeholder="Tag Name"
        required
      />
      <button type="submit">Add Tag</button>
      {error && <p>{error}</p>}
    </form>
  </div>
  );
};

export default TagForm;