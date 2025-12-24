import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { authService } from '../services/auth';
import { handleAPIError } from '../services/api';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt } from 'react-icons/fa';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    city: ''
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

    if (formData.password1 !== formData.password2) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(formData);
      
      // Автоматический вход после регистрации
      const loginData = await authService.login({
        username: formData.username,
        password: formData.password1
      });
      
      login(loginData.user, loginData.token);
      navigate('/');
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '2rem 0', minHeight: '80vh' }}>
      <div className="container">
        <div className="auth-container" style={{ maxWidth: '450px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Регистрация</h1>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <FaUser /> Имя пользователя
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
                <FaEnvelope /> Email
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaMapMarkerAlt /> Город
              </label>
              <input
                type="text"
                name="city"
                className="form-control"
                placeholder="Например: Москва"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaLock /> Пароль
              </label>
              <input
                type="password"
                name="password1"
                className="form-control"
                value={formData.password1}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaLock /> Подтверждение пароля
              </label>
              <input
                type="password"
                name="password2"
                className="form-control"
                value={formData.password2}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="auth-links" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/login">Уже есть аккаунт? Войти</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;