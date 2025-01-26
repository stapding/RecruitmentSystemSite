import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TestHistoryPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/test-history/${user.id}`);
        if (!response.ok) throw new Error('Ошибка загрузки истории');
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchHistory();
  }, [user]);

  const clearHistory = async () => {
    if (window.confirm('Вы уверены, что хотите полностью очистить историю? Это действие нельзя отменить!')) {
      try {
        const response = await fetch(`http://localhost:5000/api/test-history/${user.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Ошибка при очистке истории');
        setHistory([]);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const sortedHistory = useMemo(() => {
    const historyCopy = [...history];
    switch (sortType) {
      case 'high-low':
        return historyCopy.sort((a, b) => b.score - a.score);
      case 'low-high':
        return historyCopy.sort((a, b) => a.score - b.score);
      case 'newest':
        return historyCopy.sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
      case 'oldest':
        return historyCopy.sort((a, b) => new Date(a.test_date) - new Date(b.test_date));
      default:
        return historyCopy;
    }
  }, [history, sortType]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  const processChartData = (history) => {
    const grouped = {};
    history.forEach(item => {
      const testName = item.test_name;
      const date = new Date(item.test_date).toISOString().split('T')[0];
      
      if (!grouped[testName]) {
        grouped[testName] = {};
      }
      
      if (!grouped[testName][date] || item.score > grouped[testName][date]) {
        grouped[testName][date] = item.score;
      }
    });

    return Object.entries(grouped).map(([testName, dates]) => ({
      testName,
      data: Object.entries(dates).map(([date, score]) => ({
        date,
        score: Number(score)
      })).sort((a, b) => new Date(a.date) - new Date(b.date))
    }));
  };

  const chartData = useMemo(() => processChartData(history), [history]);

  const formatChartDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) return <div className="loading">Загрузка истории...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="test-history-page">
      <div className="history-header">
        <h2>История прохождения тестов</h2>
        
        <div className="history-controls">
          <button 
            onClick={clearHistory}
            className="clear-history-btn"
            disabled={history.length === 0}
          >
            Очистить историю
          </button>
          
          <select 
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="history-sort-select"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="high-low">По убыванию рейтинга</option>
            <option value="low-high">По возрастанию рейтинга</option>
          </select>
        </div>
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Тест</th>
              <th>Категория</th>
              <th>Дата прохождения</th>
              <th>Результат</th>
            </tr>
          </thead>
          <tbody>
            {sortedHistory.map((item) => (
              <tr key={item.history_id}>
                <td>{item.test_name}</td>
                <td>{item.competition_name}</td>
                <td>{formatDate(item.test_date)}</td>
                <td className={`score ${item.score >= 80 ? 'high' : item.score >= 50 ? 'medium' : 'low'}`}>
                  {item.score}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="charts-container">
        {chartData.map(test => (
          <div key={test.testName} className="chart-section">
            <h3>Результаты теста: {test.testName}</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={test.data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    labelFormatter={value => formatDate(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Результат (%)"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestHistoryPage;