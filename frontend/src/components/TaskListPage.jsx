import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import TaskTable from './TaskTable';
import TaskForm from './TaskForm';

const API_URL = 'http://localhost:3001/api/tasks';
const socket = io('http://localhost:3001', { transports: ['websocket'] });

function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      console.error('❌ Error fetching tasks:', err);
      showMessage('Failed to load tasks. Is the backend running?', true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handleTaskAdded = (newTask) => {
      console.log('📩 WS: taskAdded:', newTask);
      setTasks((prev) => {
        if (!prev.some((task) => task.id === newTask.id)) {
          return [newTask, ...prev];
        }
        return prev;
      });
    };

    const handleTaskUpdated = (updatedTask) => {
      console.log('📩 WS: taskUpdated:', updatedTask);
      setTasks((prev) =>
        prev.map((task) => (task.id === +updatedTask.id ? updatedTask : task))
      );
    };

    const handleTaskDeleted = ({ id }) => {
      console.log('📩 WS: taskDeleted:', id);
      setTasks((prev) => prev.filter((task) => task.id !== +id));
    };

    socket.on('taskAdded', handleTaskAdded);
    socket.on('taskUpdated', handleTaskUpdated);
    socket.on('taskDeleted', handleTaskDeleted);

    return () => {
      socket.off('taskAdded', handleTaskAdded);
      socket.off('taskUpdated', handleTaskUpdated);
      socket.off('taskDeleted', handleTaskDeleted);
    };
  }, []);

  const addTask = async (title, description) => {
    try {
      await axios.post(API_URL, { title, description });
      showMessage('Task added successfully!');
    } catch (err) {
      console.error('❌ Error adding task:', err);
      showMessage('Failed to add task.', true);
    }
  };

  const updateTask = async (id, title, description) => {
    try {
      await axios.put(`${API_URL}/${id}`, { title, description });
      showMessage('Task updated successfully!');
    } catch (err) {
      console.error('❌ Error updating task:', err);
      showMessage('Failed to update task.', true);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      showMessage('Task deleted successfully!');
    } catch (err) {
      console.error('❌ Error deleting task:', err);
      showMessage('Failed to delete task.', true);
    }
  };

  const sendEmail = async (task, email) => {
    try {
      await axios.post(`${API_URL}/send-email`, {
        to: email,
        subject: `Task: ${task.title}`,
        text: `Description: ${task.description}`,
      });
      showMessage(`Email sent to ${email} successfully!`);
    } catch (err) {
      console.error('❌ Error sending email:', err);
      showMessage('Failed to send email.', true);
    }
  };

  const sendAllTasks = async (email) => {
    try {
      await axios.post(`${API_URL}/send-all-tasks`, { to: email });
      showMessage(`All tasks sent to ${email} successfully!`);
    } catch (err) {
      console.error('❌ Error sending all tasks:', err);
      showMessage('Failed to send all tasks.', true);
    }
  };

  const showMessage = (text, isError = false) => {
    if (isError) setErrorMessage(text);
    else setSuccessMessage(text);

    setTimeout(() => {
      setErrorMessage('');
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div>
      <h1>ToDo List</h1>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <TaskForm onAddTask={addTask} />

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskTable
          tasks={tasks}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onSendEmail={sendEmail}
          onSendAllTasks={sendAllTasks}
        />
      )}
    </div>
  );
}

export default TaskListPage;
