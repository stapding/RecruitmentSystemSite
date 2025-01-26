import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TestPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Загрузка вопросов
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tests/${testId}/questions`);
        if (!response.ok) throw new Error('Ошибка загрузки вопросов');
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) fetchQuestions();
  }, [testId, isAuthenticated]);

  // Обработчик ответов
  const handleAnswerChange = (e) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: e.target.value
    }));
  };

  // Отправка результатов
  const submitTest = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, // Используем ID из контекста
          answers
        })
      });

      if (!response.ok) throw new Error('Ошибка отправки');
      const result = await response.json();
      setResults(result);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="test-container">
      {results ? (
        <div className="results">
          <h2>Результаты теста</h2>
          <p>Правильных ответов: {results.correct}/{results.total}</p>
          <p>Процент: {results.score}%</p>
          <button className='back-to-test-btn' onClick={() => navigate('/tests')}>Назад к тестам</button>
        </div>
      ) : (
        <>
          {loading && <div>Загрузка...</div>}
          {error && <div className="error">{error}</div>}
          
          {questions.length > 0 && (
            <div className="question-card">
              <div className="progress">
                Вопрос {currentQuestion + 1} из {questions.length}
              </div>
              
              <h3>{questions[currentQuestion].question}</h3>
              
              <textarea
                value={answers[questions[currentQuestion].id] || ''}
                onChange={handleAnswerChange}
                placeholder="Ваш ответ..."
              />

              <div className="navigation-buttons">
                <button
                  onClick={() => setCurrentQuestion(prev => prev - 1)}
                  disabled={currentQuestion === 0}
                >
                  Назад
                </button>

                {currentQuestion < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestion(prev => prev + 1)}
                    disabled={!answers[questions[currentQuestion].id]}
                  >
                    Далее
                  </button>
                ) : (
                  <button 
                    onClick={submitTest}
                    disabled={!answers[questions[currentQuestion].id]}
                  >
                    Отправить
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TestPage;