import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import './SearchBar.css';

function SearchBar({ onSearch, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Поиск мероприятий по названию, организатору, месту..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClear}
            aria-label="Очистить поиск"
          >
            ×
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-primary search-btn">
        Найти
      </button>
    </form>
  );
}

export default SearchBar;