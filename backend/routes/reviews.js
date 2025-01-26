const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Получение всех отзывов
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                r.review_id,
                r.text,
                r.rating,
                TO_CHAR(r.review_date, 'YYYY-MM-DD') as review_date,
                u.username
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            ORDER BY r.review_date DESC
        `);
        
        res.status(200).json(rows);
    } catch (err) {
        console.error('Ошибка при получении отзывов:', err.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


// Новый эндпоинт для проверки отзыва пользователя
router.get('/user/:user_id', async (req, res) => {
    try {
      const { user_id } = req.params;
      const { rows } = await pool.query(
        `SELECT * FROM reviews WHERE user_id = $1`,
        [user_id]
      );
      
      res.json({
        exists: rows.length > 0,
        review: rows[0] || null
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// DELETE endpoint
router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM reviews WHERE review_id = $1', [id]);
      res.status(204).end();
    } catch (err) {
      // ... обработка ошибок ... <-- тимур добавь сюда потом обработку ошибок позже
    }
});

// Создание нового отзыва (без проверки авторизации)
router.post('/', async (req, res) => {
    try {
      const { text, rating, user_id } = req.body;
  
      // Расширенная валидация
      const validationErrors = [];
      
      if (!text || text.trim().length < 10) {
        validationErrors.push({
          field: 'text',
          message: 'Текст отзыва должен содержать минимум 10 символов'
        });
      }
      
      if (!rating || Number(rating) < 1 || Number(rating) > 5) {
        validationErrors.push({
          field: 'rating',
          message: 'Рейтинг должен быть числом от 1 до 5'
        });
      }
  
      if (!user_id || isNaN(user_id)) {
        validationErrors.push({
          field: 'user_id',
          message: 'Некорректный идентификатор пользователя'
        });
      }
  
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Невалидные данные',
          validation: validationErrors
        });
      }
  
      // Проверка существования пользователя
      const userCheck = await pool.query(
        'SELECT user_id FROM users WHERE user_id = $1',
        [user_id]
      );
  
      if (userCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Пользователь не найден',
          details: `User ID: ${user_id}`
        });
      }
  
      // Создание отзыва
      const newReview = await pool.query(`
        INSERT INTO reviews (text, rating, review_date, user_id)
        VALUES ($1, $2, CURRENT_DATE, $3)
        RETURNING 
          review_id,
          text,
          rating,
          review_date,
          (SELECT username FROM users WHERE user_id = $3) as username
      `, [text.trim(), rating, user_id]);
  
      res.status(201).json({
        success: true,
        review: {
          ...newReview.rows[0],
          rating: Number(newReview.rows[0].rating)
        },
        message: 'Отзыв успешно добавлен'
      });
  
    } catch (err) {
      console.error('Ошибка создания отзыва:', {
        message: err.message,
        stack: err.stack,
        body: req.body
      });
      
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера',
        details: process.env.NODE_ENV === 'development' 
          ? err.message 
          : undefined
      });
    }
});

module.exports = router;