import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { usersAPI, handleAPIError } from '../services/api';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaBell, FaSave } from 'react-icons/fa';
import './ProfilePage.css';

function ProfilePage() {
  const { user, updateUser } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    city: user?.city || '',
    interests: user?.interests || '',
    email_notifications: user?.email_notifications ?? true,
    push_notifications: user?.push_notifications ?? false,
    notification_frequency: user?.notification_frequency || 'weekly',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        city: user.city || '',
        interests: user.interests || '',
        email_notifications: user.email_notifications ?? true,
        push_notifications: user.push_notifications ?? false,
        notification_frequency: user.notification_frequency || 'weekly',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Размер файла не должен превышать 5MB');
        return;
      }
      setAvatar(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      // Обновляем аватар если выбран
      if (avatar) {
        await usersAPI.uploadAvatar(avatar);
      }

      // Обновляем профиль
      const response = await usersAPI.updateProfile(formData);
      
      // Обновляем данные пользователя в контексте
      updateUser(response.data);
      
      setSuccess('Профиль успешно обновлен');
      setAvatar(null);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Мой профиль</h1>

        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form className="profile-form" onSubmit={handleSubmit}>
          {/* Аватар */}
          <div className="profile-avatar-section">
            <div className="avatar-display">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  <FaUser size={64} />
                </div>
              )}
            </div>
            <div className="avatar-upload">
              <label htmlFor="avatar" className="btn btn-secondary">
                Изменить фото
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              {avatar && (
                <p className="text-small text-muted mt-1">
                  Выбран файл: {avatar.name}
                </p>
              )}
            </div>
          </div>

          {/* Основная информация согласно ТЗ (п. 2.1.1.2) */}
          <div className="profile-section">
            <h2>Основная информация</h2>

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
              <p className="text-small text-muted">
                Укажите ваш город, чтобы получать уведомления о событиях
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Интересы
              </label>
              <textarea
                name="interests"
                className="form-control"
                rows="3"
                placeholder="Перечислите ваши интересы через запятую (например: музыка, спорт, культура)"
                value={formData.interests}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Настройки уведомлений согласно ТЗ (п. 2.1.4.2) */}
          <div className="profile-section">
            <h2><FaBell /> Настройки уведомлений</h2>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="email_notifications"
                  checked={formData.email_notifications}
                  onChange={handleChange}
                />
                <span>Получать уведомления по email</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="push_notifications"
                  checked={formData.push_notifications}
                  onChange={handleChange}
                />
                <span>Получать push-уведомления в браузере</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Частота уведомлений</label>
              <select
                name="notification_frequency"
                className="form-control"
                value={formData.notification_frequency}
                onChange={handleChange}
              >
                <option value="instant">Мгновенно</option>
                <option value="daily">Ежедневно</option>
                <option value="weekly">Еженедельно</option>
              </select>
            </div>
          </div>

          {/* Кнопка сохранения */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <FaSave /> {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;