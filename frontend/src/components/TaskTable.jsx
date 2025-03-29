import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function TaskTable({ tasks, onDeleteTask, onSendEmail, onSendAllTasks }) {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(null);

  const handleSendEmail = async (task) => {
    if (!email.trim()) {
      alert('Please enter an email address.');
      return;
    }
    try {
      await onSendEmail(task, email);
      setEmailSent(task.id);
      setTimeout(() => setEmailSent(null), 2000);
    } catch (error) {
      alert('Failed to send email.');
    }
  };

  const handleSendAllTasks = async () => {
    if (!email.trim()) {
      alert('Please enter an email address.');
      return;
    }
    try {
      await onSendAllTasks(email);
      alert(`All tasks sent to ${email}!`);
    } catch (error) {
      alert('Failed to send all tasks.');
    }
  };

  return (
    <div>
      <div className="email-container">
        <input
          type="email"
          className="email-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter recipient's email"
        />
        <button className="btn btn-primary" onClick={() => setEmail('')}>
          Clear
        </button>
        <button className="btn btn-success" onClick={handleSendAllTasks}>
          Send All Tasks
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td className="table-actions">
                <Link to={`/tasks/${task.id}`} className="btn btn-view">
                  View
                </Link>
                <Link to={`/tasks/${task.id}/edit`} className="btn btn-edit">
                  Edit
                </Link>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="btn btn-delete"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleSendEmail(task)}
                  className="btn btn-email"
                  disabled={emailSent === task.id}
                >
                  {emailSent === task.id ? 'Sent!' : 'Send Email'}
                </button>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan="4">No tasks found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TaskTable;
