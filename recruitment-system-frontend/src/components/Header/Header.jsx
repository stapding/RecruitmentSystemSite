import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, logout } = useAuth(); // Используем кастомный хук
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">Recruitment System</h1>
        <nav className="nav">
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/tests" className="nav-link">Тесты</Link>
          <Link to="/reviews" className="nav-link">Отзывы</Link>
          {isAuthenticated ? (
            <Link to="/profile" className="nav-link">Профиль</Link>
          ) : (
            <Link to="/login" className="nav-link">Войти</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;