import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const TaskDetail = () => {
    const { id } = useParams(); // URL パラメータから id を取得
    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
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

        fetchTaskDetails();
        fetchComments();
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

    if (!task) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Task Detail</h2>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Priority: {task.priority}</p>
            <h3>Comments</h3>
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
                    placeholder="Add a comment"
                    required
                />
                <button type="submit">Add Comment</button>
            </form>
        </div>
    );
};

export default TaskDetail;