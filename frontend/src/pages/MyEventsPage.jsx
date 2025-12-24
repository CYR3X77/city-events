import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import EventCard from '../components/EventCard';
import { FaHeart, FaCheck } from 'react-icons/fa';

function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchMyEvents();
  }, [activeTab]);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const type = activeTab === 'all' ? 'all' : activeTab;
      const response = await eventsAPI.getMyEvents(type);
      setEvents(response.data.results || response.data);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-events-page" style={{ padding: '2rem 0' }}>
      <div className="container">
        <h1>Мои мероприятия</h1>

        <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'all' ? '2px solid #2563eb' : 'none',
              color: activeTab === 'all' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'all' ? '600' : '400'
            }}
          >
            Все
          </button>
          <button
            className={`tab ${activeTab === 'interested' ? 'active' : ''}`}
            onClick={() => setActiveTab('interested')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'interested' ? '2px solid #2563eb' : 'none',
              color: activeTab === 'interested' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'interested' ? '600' : '400'
            }}
          >
            <FaHeart /> Интересные
          </button>
          <button
            className={`tab ${activeTab === 'going' ? 'active' : ''}`}
            onClick={() => setActiveTab('going')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'going' ? '2px solid #2563eb' : 'none',
              color: activeTab === 'going' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'going' ? '600' : '400'
            }}
          >
            <FaCheck /> Я пойду
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              У вас пока нет отмеченных мероприятий
            </p>
          </div>
        ) : (
          <div className="events-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyEventsPage;