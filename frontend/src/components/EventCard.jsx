import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FaMapMarkerAlt, FaClock, FaStar, FaTicketAlt } from 'react-icons/fa';
import './EventCard.css';

function EventCard({ event }) {
  // Форматирование даты
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  // Форматирование времени
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM
  };

  return (
    <Link to={`/events/${event.slug}`} className="event-card">
      {/* Изображение мероприятия */}
      <div className="event-card-image">
        {event.image ? (
          <img src={event.image} alt={event.title} />
        ) : (
          <div className="event-card-placeholder">
            <FaTicketAlt size={48} />
          </div>
        )}
        
        {/* Бейдж для рекомендуемых событий */}
        {event.is_featured && (
          <span className="featured-badge">Рекомендуем</span>
        )}
        
        {/* Бейдж для возрастного ограничения */}
        <span className="age-badge">{event.age_restriction}</span>
      </div>

      {/* Информация о мероприятии согласно ТЗ (п. 2.1.2.3) */}
      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        
        {event.short_description && (
          <p className="event-card-description">{event.short_description}</p>
        )}

        <div className="event-card-info">
          {/* Дата и время */}
          <div className="info-item">
            <FaClock className="info-icon" />
            <span>
              {formatDate(event.start_date)}
              {event.start_time && ` в ${formatTime(event.start_time)}`}
            </span>
          </div>

          {/* Место проведения */}
          <div className="info-item">
            <FaMapMarkerAlt className="info-icon" />
            <span>
              {event.venue_name || event.address}
              {event.city && ` · ${event.city}`}
            </span>
          </div>

          {/* Рейтинг и количество отзывов */}
          {event.average_rating > 0 && (
            <div className="info-item">
              <FaStar className="info-icon" style={{ color: '#f59e0b' }} />
              <span>
                {event.average_rating} ({event.reviews_count} отзывов)
              </span>
            </div>
          )}
        </div>

        {/* Категория и цена */}
        <div className="event-card-footer">
          {event.category_name && (
            <span className="event-category">{event.category_name}</span>
          )}
          
          <span className={`event-price ${event.is_free ? 'free' : ''}`}>
            {event.is_free ? (
              'Бесплатно'
            ) : event.price_min && event.price_max ? (
              `${event.price_min} - ${event.price_max} ₽`
            ) : event.price_min ? (
              `от ${event.price_min} ₽`
            ) : (
              'Платно'
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default EventCard;