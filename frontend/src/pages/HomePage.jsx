import React, { useState, useEffect } from 'react';
import { eventsAPI, categoriesAPI } from '../services/api';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import EventCard from '../components/EventCard';
import { FaSearch, FaFilter } from 'react-icons/fa';
import './HomePage.css';

function HomePage() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Параметры поиска и фильтрации согласно ТЗ (п. 2.1.2.1, 2.1.2.2)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    is_free: '',
    age_restriction: '',
    start_date_from: '',
    start_date_to: '',
    ordering: 'start_date',
  });

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Формируем параметры запроса, убирая пустые значения
      const params = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await eventsAPI.getAll(params);
      setEvents(response.data.results || response.data);
    } catch (err) {
      setError('Ошибка при загрузке мероприятий. Попробуйте позже.');
      console.error('Ошибка загрузки событий:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      is_free: '',
      age_restriction: '',
      start_date_from: '',
      start_date_to: '',
      ordering: 'start_date',
    });
  };

  return (
    <div className="home-page">
      {/* Главная страница с поисковой строкой согласно ТЗ (п. 2.3.2.1) */}
      <section className="hero-section">
        <div className="container">
          <h1>Найдите интересные события в вашем городе</h1>
          <p className="text-muted">Более {events.length} актуальных мероприятий</p>
          
          <SearchBar onSearch={handleSearch} initialValue={filters.search} />
          
          <button 
            className="btn btn-outline mt-3"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>
        </div>
      </section>

      {/* Фильтры согласно ТЗ (п. 2.1.2.2) */}
      {showFilters && (
        <section className="filters-section">
          <div className="container">
            <Filters
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>
        </section>
      )}

      {/* Список мероприятий согласно ТЗ (п. 2.1.2.3) */}
      <section className="events-section">
        <div className="container">
          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Загрузка мероприятий...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="no-events">
              <FaSearch size={64} color="#cbd5e1" />
              <h3>Мероприятия не найдены</h3>
              <p>Попробуйте изменить параметры поиска или фильтры</p>
              <button className="btn btn-primary mt-3" onClick={handleResetFilters}>
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div className="events-header">
                <h2>Актуальные мероприятия</h2>
                <div className="sort-controls">
                  <label>Сортировка:</label>
                  <select 
                    value={filters.ordering}
                    onChange={(e) => handleFilterChange('ordering', e.target.value)}
                    className="form-control"
                  >
                    <option value="start_date">По дате (ближайшие)</option>
                    <option value="-start_date">По дате (дальние)</option>
                    <option value="-created_at">Новые</option>
                    <option value="-views_count">Популярные</option>
                  </select>
                </div>
              </div>

              <div className="events-grid">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;