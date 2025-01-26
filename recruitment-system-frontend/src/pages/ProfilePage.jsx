import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const ProfilePage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    console.log('Данные пользователя:', user);
  }, [user]);

  // Функция для форматирования пустых значений
  const formatValue = (value) => 
    value ? value : <span className="empty">Не указано</span>;

  if (!user) return null;

  return (
    <div className="profile-page">
      <h2>Профиль пользователя</h2>

      <div className="profile-info">
        <div className="info-item">
          <span className="label">Имя:</span>
          <span className="value">{formatValue(user.first_name)}</span>
        </div>

        <div className="info-item">
          <span className="label">Фамилия:</span>
          <span className="value">{formatValue(user.last_name)}</span>
        </div>

        <div className="info-item">
          <span className="label">Email:</span>
          <span className="value">{user.email}</span>
        </div>

        <div className="info-item">
          <span className="label">Телефон:</span>
          <span className="value">{formatValue(user.phone)}</span>
        </div>

        <div className="info-item">
          <span className="label">Компания:</span>
          <span className="value">{formatValue(user.company)}</span>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          onClick={() => navigate('/test-history')}
          className="history-btn"
        >
          История тестов
        </button>
        
        <button 
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="logout-btn"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;