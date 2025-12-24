import React, { useState } from 'react';
import { reviewsAPI, handleAPIError } from '../services/api';
import { FaStar } from 'react-icons/fa';
import './ReviewForm.css';

function ReviewForm({ eventId, onSuccess, onCancel }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация согласно ТЗ (п. 2.1.3.1)
    if (rating === 0) {
      setError('Пожалуйста, поставьте оценку');
      return;
    }

    if (text.trim().length < 10) {
      setError('Отзыв должен содержать минимум 10 символов');
      return;
    }

    setLoading(true);

    try {
      await reviewsAPI.create({
        event: eventId,
        rating,
        text: text.trim(),
      });

      // Успешное создание отзыва
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Оставить отзыв</h3>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* Рейтинг в звездах */}
      <div className="form-group">
        <label className="form-label">Ваша оценка *</label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <FaStar />
            </button>
          ))}
          {rating > 0 && (
            <span className="rating-text">
              {rating === 1 && 'Плохо'}
              {rating === 2 && 'Неплохо'}
              {rating === 3 && 'Нормально'}
              {rating === 4 && 'Хорошо'}
              {rating === 5 && 'Отлично'}
            </span>
          )}
        </div>
      </div>

      {/* Текст отзыва */}
      <div className="form-group">
        <label className="form-label">Ваш отзыв *</label>
        <textarea
          className="form-control"
          rows="5"
          placeholder="Поделитесь своими впечатлениями о мероприятии..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          minLength={10}
        />
        <div className="char-count">
          {text.length} / {text.length >= 10 ? '✓' : 'минимум 10 символов'}
        </div>
      </div>

      {/* Кнопки */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || rating === 0 || text.trim().length < 10}
        >
          {loading ? 'Отправка...' : 'Отправить отзыв'}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Отмена
          </button>
        )}
      </div>

      <p className="text-small text-muted mt-2">
        * Отзыв будет опубликован после модерации
      </p>
    </form>
  );
}

export default ReviewForm;