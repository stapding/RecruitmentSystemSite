const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Роут для получения списка тестов с фильтрацией
router.get('/', async (req, res) => {
  try {
    const { competitionId } = req.query;
    
    let queryText = `
      SELECT 
        t.test_id AS id,
        t.name,
        t.description,
        t.competition_id,
        COUNT(q.question_id) AS questions_count
      FROM tests t
      LEFT JOIN questions q ON t.test_id = q.test_id
    `;

    const queryParams = [];
    
    if (competitionId) {
      queryText += ' WHERE t.competition_id = $1';
      queryParams.push(competitionId);
    }
    
    queryText += ' GROUP BY t.test_id, t.name, t.description, t.competition_id ORDER BY t.name';
    
    const { rows } = await pool.query(queryText, queryParams);
    res.json(rows);
    
  } catch (err) {
    console.error('Error fetching tests:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Роут для получения вопросов теста
router.get('/:testId/questions', async (req, res) => {
  try {
    const { testId } = req.params;
    
    // Проверка существования теста
    const testCheck = await pool.query(
      'SELECT test_id FROM tests WHERE test_id = $1',
      [testId]
    );
    
    if (testCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Получение вопросов
    const { rows } = await pool.query(
      `SELECT 
        question_id AS id,
        question,
        answer 
       FROM questions 
       WHERE test_id = $1 
       ORDER BY question_id`,
      [testId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No questions found for this test' });
    }
    
    res.json(rows);
    
  } catch (err) {
    console.error(`[GET /tests/${req.params.testId}/questions] Error:`, err);
    res.status(500).json({ 
      error: 'Failed to load questions',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Роут для отправки результатов теста
router.post('/:testId/submit', async (req, res) => {
  try {
    const { testId } = req.params;
    const { userId, answers } = req.body;

    // Валидация входных данных
    if (!userId || !answers || typeof answers !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: 'Expected { userId: number, answers: { [questionId]: string } }'
      });
    }

    // Проверка существования теста
    const testCheck = await pool.query(
      'SELECT test_id FROM tests WHERE test_id = $1',
      [testId]
    );
    if (testCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Получение вопросов теста
    const { rows: questions } = await pool.query(
      `SELECT 
        question_id AS id, 
        answer 
       FROM questions 
       WHERE test_id = $1`,
      [testId]
    );

    if (questions.length === 0) {
      return res.status(400).json({ error: 'Test has no questions' });
    }

    // Проверка ответов
    let correctAnswers = 0;
    const details = [];

    for (const question of questions) {
      const questionId = String(question.id);
      const expectedAnswer = question.answer.trim().toLowerCase();
      const userAnswer = (answers[questionId] || '').trim().toLowerCase();

      const isCorrect = expectedAnswer === userAnswer;
      if (isCorrect) correctAnswers++;

      details.push({
        questionId,
        expected: expectedAnswer,
        received: userAnswer,
        isCorrect
      });
    }

    // Расчет результата
    const totalQuestions = questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Сохранение в историю
    await pool.query(
      `INSERT INTO test_history 
        (user_id, test_id, score, test_date)
       VALUES ($1, $2, $3, $4)`,
      [userId, testId, score, new Date()]
    );

    // Формирование ответа
    res.json({
      success: true,
      score,
      total: totalQuestions,
      correct: correctAnswers,
      details
    });

  } catch (err) {
    console.error('Test submission error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;