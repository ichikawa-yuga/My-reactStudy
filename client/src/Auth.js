import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // CSS ファイルをインポート

const Auth = ({ type }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:3001/login', { username, password });
        localStorage.setItem('token', response.data.token);
        navigate('/tasks');
    } catch (err) {
        console.error('Login error:', err.response ? err.response.data : err.message);
        setError('Invalid username or password');
    }
};

return (
  <div className="auth-container">
    <h2>{type === 'login' ? 'Login' : 'Register'}</h2>
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">{type === 'login' ? 'Login' : 'Register'}</button>
      {error && <p className="error">{typeof error === 'string' ? error : 'An unexpected error occurred'}</p>}
    </form>
  </div>
);
};
export default Auth;