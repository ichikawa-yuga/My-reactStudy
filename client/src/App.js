import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail'; // 詳細表示用のコンポーネント

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TaskList />} />
        <Route path="/task-form/:id" element={<TaskForm />} />
        <Route path="/task-detail/:id" element={<TaskDetail />} />
      </Routes>
    </Router>
  );
}

export default App;