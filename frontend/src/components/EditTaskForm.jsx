import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditTaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTask();
  }, []);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3001/api/tasks/${id}`);
      setTitle(res.data.title);
      setDescription(res.data.description || '');
      setError('');
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to load this task for editing.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/api/tasks/${id}`, {
        title,
        description,
      });
      navigate(`/tasks/${id}`);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task.');
    }
  };

  if (loading) {
    return <p>Loading task...</p>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="edit-form">
      <h2>Edit Task</h2>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
        />

        <label>Description</label>
        <input
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
        />

        <button type="submit" className="btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditTaskForm;
