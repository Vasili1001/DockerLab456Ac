import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTask();
  }, []);

  const fetchTask = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/tasks/${id}`);
      setTask(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to load this task.');
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!task) {
    return <p>Loading task...</p>;
  }

  return (
    <div className="detail-view">
      <h2>Task Detail</h2>
      <p>
        <strong>ID:</strong> {task.id}
      </p>
      <p>
        <strong>Title:</strong> {task.title}
      </p>
      <p>
        <strong>Description:</strong> {task.description}
      </p>
      <p>
        <strong>Created At:</strong> {task.created_at}
      </p>
      <Link to="/" className="btn-secondary">
        Back to Home
      </Link>{' '}
      <Link to={`/tasks/${task.id}/edit`} className="btn-warning">
        Edit
      </Link>
    </div>
  );
}

export default TaskDetail;
