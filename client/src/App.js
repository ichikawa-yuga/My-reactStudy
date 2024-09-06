import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './Auth';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail'; // TaskDetailをインポート

const App = () => {
  const [editingTask, setEditingTask] = useState(null);

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth type="login" />} />
        <Route path="/register" element={<Auth type="register" />} />
        <Route path="/tasks" element={<TaskList onEdit={handleEditTask} />} />
        <Route 
          path="/task-form" 
          element={<TaskForm task={editingTask} onSave={() => setEditingTask(null)} />} 
        />
        <Route 
          path="/task-detail/:id" 
          element={<TaskDetail />} 
        />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/task-form/:id" element={<TaskForm />} />
        <Route path="/task-detail/:id" element={<TaskDetail />} />
      </Routes>
    </Router>
  );
};

export default App;