import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FaStar, FaUser } from 'react-icons/fa';
import './ReviewList.css';

function ReviewList({ reviews }) {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'star-filled' : 'star-empty'}
          />
        ))}
      </div>
    );
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="no-reviews">
        <p>Пока нет отзывов. Будьте первым!</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <div className="review-author">
              {review.user_avatar ? (
                <img
                  src={review.user_avatar}
                  alt={review.user_username}
                  className="review-avatar"
                />
              ) : (
                <div className="review-avatar-placeholder">
                  <FaUser />
                </div>
              )}
              <div>
                <div className="review-username">
                  {review.user_username || 'Пользователь'}
                </div>
                <div className="review-date text-small text-muted">
                  {formatDate(review.created_at)}
                </div>
              </div>
            </div>
            {renderStars(review.rating)}
          </div>

          <div className="review-text">
            <p>{review.text}</p>
          </div>

          {/* Статус модерации (для будущего функционала) */}
          {review.status === 'pending' && (
            <div className="review-status">
              <span className="badge badge-warning">На модерации</span>
            </div>
          )}
          {review.status === 'rejected' && (
            <div className="review-status">
              <span className="badge badge-error">Отклонен</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ReviewList;