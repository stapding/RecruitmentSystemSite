import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TestsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getQuestionWordForm = (count) => {
    const lastTwo = count % 100;
    if (lastTwo >= 11 && lastTwo <= 14) return 'вопросов';
    
    const lastOne = count % 10;
    switch (lastOne) {
      case 1: return 'вопрос';
      case 2:
      case 3:
      case 4: return 'вопроса';
      default: return 'вопросов';
    }
  };

  // Загрузка компетенций
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/competitions');
        if (!response.ok) throw new Error('Failed to load competitions');
        const data = await response.json();
        setCompetitions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  // Загрузка тестов
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const url = selectedCompetition
          ? `http://localhost:5000/api/tests?competitionId=${selectedCompetition}`
          : 'http://localhost:5000/api/tests';

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load tests');
        const data = await response.json();
        setTests(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (!loading) fetchTests();
  }, [selectedCompetition, loading]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="tests-page">
      <h2>Доступные тесты</h2>

      <div className="filters">
        <select
          value={selectedCompetition}
          onChange={(e) => setSelectedCompetition(e.target.value)}
          className="competition-filter"
        >
          <option value="">Все категории</option>
          {competitions.map((competition) => (
            <option
              key={competition.competition_id}
              value={competition.competition_id}
            >
              {competition.name}
            </option>
          ))}
        </select>
      </div>

      <div className="tests-grid">
        {tests.length === 0 ? (
          <div className="no-tests">Нет тестов в этой категории</div>
        ) : (
          tests.map((test) => (
            <div key={test.test_id} className="test-card">
              <div className="card-header">
                <h3>{test.name}</h3>
                {test.competition_id && (
                  <span className="category-tag">
                    {
                      competitions.find(
                        (c) => c.competition_id === test.competition_id
                      )?.name
                    }
                  </span>
                )}
              </div>
              <p className="description">
                {test.description || 'No description available'}
              </p>
              <div className="card-footer">
                <span className="questions-count">
                  {test.questions_count} {getQuestionWordForm(test.questions_count)}
                </span>
                <button
                  className="start-btn"
                  onClick={() => navigate(`/test/${test.id}`)} // Используем test.id вместо test.test_id
                  disabled={test.questions_count === 0}
                >
                  Начать тест
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TestsPage;