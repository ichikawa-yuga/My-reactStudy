import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './Auth';
import TaskList from './TaskList';
import TaskForm from './TaskForm';

// プライベートルートコンポーネント
const PrivateRoute = ({ element: Component, ...rest }) => {
    const token = localStorage.getItem('token');
    return token ? <Component {...rest} /> : <Navigate to="/login" />;
};

// メインAppコンポーネント
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Auth type="login" />} />
                <Route path="/register" element={<Auth type="register" />} />
                <Route
                    path="/tasks"
                    element={<PrivateRoute element={TaskList} />}
                />
                <Route
                    path="/task-form"
                    element={<PrivateRoute element={TaskForm} />}
                />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default App;


