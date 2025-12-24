import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/EventDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyEventsPage from './pages/MyEventsPage';

// Auth context
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events/:slug" element={<EventDetailPage />} />
              <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
              <Route 
                path="/profile" 
                element={user ? <ProfilePage /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/my-events" 
                element={user ? <MyEventsPage /> : <Navigate to="/login" />} 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;