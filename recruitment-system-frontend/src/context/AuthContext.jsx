import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    const checkSession = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/check-session', {
          headers: { 'Authorization': sessionId },
          signal: controller.signal
        });

        if (response.ok) {
          const { user } = await response.json();
          setUser(user);
        } else {
          localStorage.removeItem('sessionId');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Ошибка проверки сессии:', err);
          localStorage.removeItem('sessionId');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    return () => controller.abort();
  }, []);

  const login = (userData) => {
    localStorage.setItem('sessionId', userData.sessionId);
    setUser(userData.user);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': localStorage.getItem('sessionId') }
      });
    } catch (err) {
      console.error('Ошибка выхода:', err);
    } finally {
      localStorage.removeItem('sessionId');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);