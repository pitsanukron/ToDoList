const pool = require('../config/db');

// Get all tasks for a project
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = 'SELECT * FROM tasks ORDER BY created_at DESC';
    let values = [];
    if (projectId) {
      query = 'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC';
      values = [projectId];
    }
    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a task
const createTask = async (req, res) => {
  try {
    const { title, description, project_id, due_date, priority, status } = req.body;
    if (!title || !project_id || !due_date || !priority) {
      return res.status(400).json({ error: 'Title, project_id, due_date, and priority are required' });
    }
    const result = await pool.query(
      'INSERT INTO tasks (title, description, project_id, due_date, priority, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description || null, project_id, due_date, priority, status || 'Backlog']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a task (for drag & drop, due date change, priority change)
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, priority, status } = req.body;
    
    // Build dynamic update query
    let updateFields = [];
    let values = [];
    let argCounter = 1;

    if (title !== undefined) { updateFields.push(`title = $${argCounter++}`); values.push(title); }
    if (description !== undefined) { updateFields.push(`description = $${argCounter++}`); values.push(description); }
    if (due_date !== undefined) { updateFields.push(`due_date = $${argCounter++}`); values.push(due_date); }
    if (priority !== undefined) { updateFields.push(`priority = $${argCounter++}`); values.push(priority); }
    if (status !== undefined) { updateFields.push(`status = $${argCounter++}`); values.push(status); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${argCounter} RETURNING *`;
    
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
