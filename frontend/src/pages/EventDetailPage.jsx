import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { eventsAPI, reviewsAPI } from '../services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Map from '../components/Map';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import { 
  FaMapMarkerAlt, FaClock, FaUser, FaPhone, FaEnvelope, 
  FaGlobe, FaHeart, FaCheck, FaShare, FaStar, FaTicketAlt 
} from 'react-icons/fa';
import './EventDetailPage.css';

function EventDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchEvent();
    fetchReviews();
  }, [slug]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await eventsAPI.getById(slug);
      setEvent(response.data);
    } catch (err) {
      setError('Мероприятие не найдено');
      console.error('Ошибка загрузки мероприятия:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getByEvent(slug);
      setReviews(response.data.results || response.data);
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
    }
  };

  const handleInterested = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await eventsAPI.markInterested(slug);
      fetchEvent(); // Обновляем данные
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  const handleGoing = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await eventsAPI.markGoing(slug);
      fetchEvent(); // Обновляем данные
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.short_description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Ошибка при шаринге:', err);
      }
    } else {
      // Копируем ссылку в буфер обмена
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mt-4">
        <div className="alert alert-error">{error || 'Мероприятие не найдено'}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Вернуться к списку
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const isInterested = event.user_interaction?.includes('interested');
  const isGoing = event.user_interaction?.includes('going');
  const isPastEvent = new Date(event.start_date) < new Date();

  return (
    <div className="event-detail-page">
      <div className="container">
        {/* Изображение */}
        {event.image && (
          <div className="event-hero-image">
            <img src={event.image} alt={event.title} />
          </div>
        )}

        {/* Основная информация согласно ТЗ (п. 2.1.2.4) */}
        <div className="event-content">
          <div className="event-main">
            <div className="event-header">
              <h1>{event.title}</h1>
              
              <div className="event-actions">
                <button 
                  className={`btn ${isInterested ? 'btn-success' : 'btn-outline'}`}
                  onClick={handleInterested}
                >
                  <FaHeart /> {isInterested ? 'В избранном' : 'Интересно'}
                </button>
                
                <button 
                  className={`btn ${isGoing ? 'btn-success' : 'btn-primary'}`}
                  onClick={handleGoing}
                >
                  <FaCheck /> {isGoing ? 'Вы идете' : 'Я пойду'}
                </button>
                
                <button className="btn btn-secondary" onClick={handleShare}>
                  <FaShare /> Поделиться
                </button>
              </div>
            </div>

            {/* Рейтинг */}
            {event.average_rating > 0 && (
              <div className="event-rating">
                <FaStar color="#f59e0b" size={24} />
                <span className="rating-value">{event.average_rating}</span>
                <span className="rating-count">({event.reviews_count} отзывов)</span>
              </div>
            )}

            {/* Краткая информация */}
            <div className="event-quick-info">
              <div className="info-block">
                <FaClock className="icon" />
                <div>
                  <strong>Когда:</strong>
                  <p>
                    {formatDate(event.start_date)}
                    {event.start_time && ` в ${event.start_time.slice(0, 5)}`}
                    {event.end_date && ` - ${formatDate(event.end_date)}`}
                  </p>
                </div>
              </div>

              <div className="info-block">
                <FaMapMarkerAlt className="icon" />
                <div>
                  <strong>Где:</strong>
                  <p>{event.venue_name || event.address}</p>
                  <p className="text-muted">{event.city}</p>
                </div>
              </div>

              <div className="info-block">
                <FaTicketAlt className="icon" />
                <div>
                  <strong>Стоимость:</strong>
                  <p>
                    {event.is_free ? 'Бесплатно' : 
                      event.price_min && event.price_max ? 
                        `${event.price_min} - ${event.price_max} ₽` :
                      event.price_min ? 
                        `от ${event.price_min} ₽` : 
                        'Платно'
                    }
                  </p>
                  {event.ticket_url && (
                    <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm mt-1">
                      Купить билеты
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Полное описание */}
            <div className="event-description">
              <h2>Описание</h2>
              <p>{event.description}</p>
            </div>

            {/* Видео */}
            {event.video_url && (
              <div className="event-video">
                <h2>Видео</h2>
                <iframe
                  src={event.video_url}
                  title={event.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* Отзывы согласно ТЗ (п. 2.1.3.1, 2.1.3.2) */}
            <div className="event-reviews">
              <h2>Отзывы</h2>
              
              {user && isPastEvent && !showReviewForm && (
                <button 
                  className="btn btn-primary mb-3"
                  onClick={() => setShowReviewForm(true)}
                >
                  Оставить отзыв
                </button>
              )}

              {showReviewForm && (
                <ReviewForm
                  eventId={event.id}
                  onSuccess={() => {
                    setShowReviewForm(false);
                    fetchReviews();
                    fetchEvent();
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              )}

              <ReviewList reviews={reviews} />
            </div>
          </div>

          {/* Боковая панель */}
          <div className="event-sidebar">
            {/* Организатор */}
            <div className="sidebar-block">
              <h3>Организатор</h3>
              <div className="organizer-info">
                <p><FaUser /> {event.organizer}</p>
                {event.organizer_phone && (
                  <p><FaPhone /> {event.organizer_phone}</p>
                )}
                {event.organizer_email && (
                  <p><FaEnvelope /> {event.organizer_email}</p>
                )}
                {event.organizer_website && (
                  <p>
                    <FaGlobe />
                    <a href={event.organizer_website} target="_blank" rel="noopener noreferrer">
                      Сайт
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Карта согласно ТЗ (п. 2.1.2.5) */}
            {event.latitude && event.longitude && (
              <div className="sidebar-block">
                <h3>Место на карте</h3>
                <Map 
                  latitude={parseFloat(event.latitude)} 
                  longitude={parseFloat(event.longitude)}
                  title={event.venue_name || event.title}
                  address={event.address}
                />
              </div>
            )}

            {/* Дополнительная информация */}
            <div className="sidebar-block">
              <h3>Дополнительно</h3>
              <ul className="info-list">
                <li>Категория: <strong>{event.category_name}</strong></li>
                <li>Возраст: <strong>{event.age_restriction}</strong></li>
                <li>Просмотров: <strong>{event.views_count}</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;