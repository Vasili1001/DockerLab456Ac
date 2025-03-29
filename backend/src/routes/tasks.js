const express = require('express');
const router = express.Router();
const db = require('../db');
const { fetchEmails } = require('../mailReceive');
const { sendMail } = require('../mail');
const { getSocketInstance } = require('../socket');

router.get('/check-email', async (req, res) => {
  try {
    const messages = await fetchEmails();
    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: 'No new emails found' });
    }
    res.json(messages);
  } catch (error) {
    console.error('❌ Failed to fetch emails:', error);
    res.status(500).json({ message: 'Failed to fetch emails', error });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, title, description, created_at
      FROM tasks
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      'SELECT id, title, description, created_at FROM tasks WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error fetching task:', error);
    res.status(500).json({ message: 'Error fetching task', error });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: 'Title and description are required' });
    }

    const [result] = await db.execute(
      `
        INSERT INTO tasks (title, description, created_at)
        VALUES (?, ?, NOW())
      `,
      [title, description]
    );

    const newTask = {
      id: result.insertId,
      title,
      description,
    };

    try {
      const io = getSocketInstance();
      io.emit('taskAdded', newTask);
    } catch (socketError) {
      console.error('⚠️ WebSocket error (taskAdded):', socketError);
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error('❌ Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: 'Title and description are required' });
    }

    const [result] = await db.execute(
      'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
      [title, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = { id, title, description };

    console.log('📡 Sending WebSocket event taskUpdated:', updatedTask);

    try {
      const io = getSocketInstance();
      io.emit('taskUpdated', updatedTask);
    } catch (socketError) {
      console.error('⚠️ WebSocket error (taskUpdated):', socketError);
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('❌ Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('📡 Sending WebSocket event taskDeleted:', { id });

    try {
      const io = getSocketInstance();
      io.emit('taskDeleted', { id });
    } catch (socketError) {
      console.error('⚠️ WebSocket error (taskDeleted):', socketError);
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task', error });
  }
});

router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    if (!to || !subject || !text) {
      return res
        .status(400)
        .json({ message: 'To, subject, and text are required' });
    }

    const result = await sendMail({ to, subject, text });
    res.json({ message: '✅ Email sent!', result });
  } catch (error) {
    console.error('❌ Email failed:', error);
    res.status(500).json({ message: 'Email failed', error });
  }
});

router.post('/send-all-tasks', async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    const [tasks] = await db.execute(
      'SELECT title, description FROM tasks ORDER BY created_at DESC'
    );

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found to send' });
    }

    const taskList = tasks
      .map((task, index) => `${index + 1}. ${task.title} - ${task.description}`)
      .join('\n');

    const result = await sendMail({
      to,
      subject: 'Your To-Do List',
      text: `Here is your complete task list:\n\n${taskList}`,
    });

    res.json({ message: '✅ All tasks sent!', result });
  } catch (error) {
    console.error('❌ Failed to send all tasks:', error);
    res.status(500).json({ message: 'Failed to send all tasks', error });
  }
});

module.exports = router;
