import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TaskListPage from './components/TaskListPage';
import TaskDetail from './components/TaskDetail';
import EditTaskForm from './components/EditTaskForm';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TaskListPage />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="tasks/:id/edit" element={<EditTaskForm />} />
      </Route>
    </Routes>
  );
}

export default App;
