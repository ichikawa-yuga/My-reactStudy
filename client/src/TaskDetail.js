import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './TaskDetail.css'; // CSS ファイルをインポート

const TaskDetail = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setTask(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/comments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setComments(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchFiles = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/tasks/${id}/files`, { headers: { Authorization: `Bearer ${token}` } });
                setFiles(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchTaskDetails();
        fetchComments();
        fetchFiles();
    }, [id, token]);

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/comments', { task_id: id, comment: newComment }, { headers: { Authorization: `Bearer ${token}` } });
            setNewComment('');
            const response = await axios.get(`http://localhost:3001/comments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setComments(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('No file selected.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            await axios.post(`http://localhost:3001/tasks/${id}/upload`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
            setSelectedFile(null);
            const response = await axios.get(`http://localhost:3001/tasks/${id}/files`, { headers: { Authorization: `Bearer ${token}` } });
            setFiles(response.data);
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };

    if (!task) {
        return <div>Loading...</div>;
    }

    return (
      <div className="task-detail-container">
      <h2>タスク詳細</h2>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p>優先度: {task.priority}</p>
      <h3>コメント</h3>
      <ul>
          {comments.map(comment => (
              <li key={comment.id}>
                  <strong>{comment.username}:</strong> {comment.comment} <em>({new Date(comment.created_at).toLocaleString()})</em>
              </li>
          ))}
      </ul>
      <form onSubmit={handleCommentSubmit}>
          <textarea
              value={newComment}
              onChange={handleCommentChange}
              placeholder="コメントを追加"
              required
          />
          <button type="submit">コメントを追加</button>
      </form>
      <h3>ファイル</h3>
      <form onSubmit={handleFileUpload}>
          <input type="file" onChange={handleFileChange} required />
          <button type="submit">ファイルをアップロード</button>
      </form>
      <ul>
          {files.map(file => (
              <li key={file.id}>
                  <a href={`http://localhost:3001/tasks/${id}/files/${file.file_path}`} download>{file.file_path}</a>
              </li>
          ))}
      </ul>
  </div>
    );
};

export default TaskDetail;