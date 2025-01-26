import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header';
import HomePage from './pages/HomePage';
import TestsPage from './pages/TestsPage';
import TestPage from './pages/TestPage';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import TestHistoryPage from './pages/TestHistoryPage';
import ReviewsPage from './pages/ReviewsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tests" element={<TestsPage />} />
              <Route path="/test/:testId" element={<TestPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/test-history" element={<TestHistoryPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;