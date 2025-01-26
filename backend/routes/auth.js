const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Временное хранилище сессий
const sessions = {};

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Получаем полные данные пользователя включая пароль
    const { rows } = await pool.query(
      `SELECT 
        user_id AS id,
        email,
        password,
        first_name,
        last_name,
        phone,
        company
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    const user = rows[0];

    // Проверка пароля
    if (user.password !== password) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    // Создаем сессию
    const sessionId = Date.now().toString();
    sessions[sessionId] = user.id;

    // Формируем ответ без пароля
    const { password: _, ...userData } = user;
    
    res.json({
      success: true,
      user: userData,
      sessionId
    });

  } catch (err) {
    console.error('Ошибка авторизации:', err);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Проверка активной сессии
router.get('/check-session', async (req, res) => {
  try {
    const sessionId = req.headers.authorization;
    
    if (!sessionId || !sessions[sessionId]) {
      return res.status(401).json({ error: 'Сессия недействительна' });
    }

    const { rows } = await pool.query(
      `SELECT 
        user_id AS id,
        email,
        first_name,
        last_name,
        phone,
        company
       FROM users 
       WHERE user_id = $1`,
      [sessions[sessionId]]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ user: rows[0] });

  } catch (err) {
    console.error('Ошибка проверки сессии:', err);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;