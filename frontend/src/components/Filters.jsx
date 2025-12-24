import React from 'react';
import './Filters.css';

function Filters({ categories, filters, onFilterChange, onReset }) {
  const ageRestrictions = ['0+', '6+', '12+', '16+', '18+'];

  return (
    <div className="filters">
      <h3>Фильтры</h3>
      
      <div className="filters-grid">
        {/* Категория согласно ТЗ (п. 2.1.2.2) */}
        <div className="filter-group">
          <label className="filter-label">Категория</label>
          <select
            className="form-control"
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="">Все категории</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Город */}
        <div className="filter-group">
          <label className="filter-label">Город</label>
          <input
            type="text"
            className="form-control"
            placeholder="Введите город"
            value={filters.city}
            onChange={(e) => onFilterChange('city', e.target.value)}
          />
        </div>

        {/* Дата начала */}
        <div className="filter-group">
          <label className="filter-label">Дата от</label>
          <input
            type="date"
            className="form-control"
            value={filters.start_date_from}
            onChange={(e) => onFilterChange('start_date_from', e.target.value)}
          />
        </div>

        {/* Дата окончания */}
        <div className="filter-group">
          <label className="filter-label">Дата до</label>
          <input
            type="date"
            className="form-control"
            value={filters.start_date_to}
            onChange={(e) => onFilterChange('start_date_to', e.target.value)}
          />
        </div>

        {/* Бесплатные/платные согласно ТЗ (п. 2.1.2.2) */}
        <div className="filter-group">
          <label className="filter-label">Стоимость</label>
          <select
            className="form-control"
            value={filters.is_free}
            onChange={(e) => onFilterChange('is_free', e.target.value)}
          >
            <option value="">Все</option>
            <option value="true">Бесплатные</option>
            <option value="false">Платные</option>
          </select>
        </div>

        {/* Возрастные ограничения согласно ТЗ (п. 2.1.2.2) */}
        <div className="filter-group">
          <label className="filter-label">Возраст</label>
          <select
            className="form-control"
            value={filters.age_restriction}
            onChange={(e) => onFilterChange('age_restriction', e.target.value)}
          >
            <option value="">Все возрасты</option>
            {ageRestrictions.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>

        {/* Организатор согласно ТЗ (п. 2.1.2.2) */}
        <div className="filter-group">
          <label className="filter-label">Организатор</label>
          <input
            type="text"
            className="form-control"
            placeholder="Название организатора"
            value={filters.organizer}
            onChange={(e) => onFilterChange('organizer', e.target.value)}
          />
        </div>

        {/* Кнопка сброса */}
        <div className="filter-group filter-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onReset}
          >
            Сбросить все фильтры
          </button>
        </div>
      </div>
    </div>
  );
}

export default Filters;