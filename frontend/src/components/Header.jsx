import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { notificationsAPI } from '../services/api';
import { FaBell, FaUser, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';
import './Header.css';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Обновляем счетчик каждые 60 секунд
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Ошибка получения уведомлений:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <FaCalendarAlt className="logo-icon" />
            <span>Городские События</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">События</Link>
            
            {user ? (
              <>
                <Link to="/my-events" className="nav-link">Мои события</Link>
                
                <div className="user-section">
                  <button className="notification-btn" onClick={() => navigate('/notifications')}>
                    <FaBell />
                    {unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount}</span>
                    )}
                  </button>

                  <div className="user-menu">
                    <button 
                      className="user-btn"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="user-avatar" />
                      ) : (
                        <FaUser />
                      )}
                      <span>{user.username}</span>
                    </button>

                    {showUserMenu && (
                      <div className="user-dropdown">
                        <Link to="/profile" className="dropdown-item">
                          <FaUser /> Профиль
                        </Link>
                        <button onClick={handleLogout} className="dropdown-item">
                          <FaSignOutAlt /> Выйти
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">Войти</Link>
                <Link to="/register" className="btn btn-primary">Регистрация</Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;