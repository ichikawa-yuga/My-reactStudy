import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = ({ type }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = type === 'login' ? 'http://localhost:3001/login' : 'http://localhost:3001/register';
            const response = await axios.post(url, { username, password });
            if (type === 'login') {
                localStorage.setItem('token', response.data.token);
                navigate('/tasks');
            } else {
                navigate('/login');
            }
        } catch (err) {
            setError(type === 'login' ? 'Invalid username or password' : 'Registration failed');
        }
    };

    return (
        <div>
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
                {error && <p>{error}</p>}
            </form>
        </div>
    );
};

export default Auth;