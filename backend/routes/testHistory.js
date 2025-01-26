const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { rows } = await pool.query(
      `SELECT 
        th.test_history_id,
        t.name AS test_name,
        c.name AS competition_name,
        th.score,
        th.test_date
       FROM test_history th
       JOIN tests t ON th.test_id = t.test_id
       LEFT JOIN competitions c ON t.competition_id = c.competition_id
       WHERE th.user_id = $1
       ORDER BY th.test_date DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Ошибка получения истории:', err);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await pool.query(
      'DELETE FROM test_history WHERE user_id = $1',
      [userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка удаления истории:', err);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;