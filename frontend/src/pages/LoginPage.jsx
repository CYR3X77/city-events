import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { authService } from '../services/auth';
import { handleAPIError } from '../services/api';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { token, user } = await authService.login(formData);
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '2rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="auth-container" style={{ maxWidth: '450px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Вход в систему</h1>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <FaEnvelope /> Email или имя пользователя
              </label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaLock /> Пароль
              </label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="auth-links" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;