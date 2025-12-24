import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <FaCalendarAlt />
              <span>Городские События</span>
            </div>
            <p className="footer-description">
              Информационная система для поиска и планирования городских мероприятий и событий
            </p>
          </div>

          <div className="footer-section">
            <h4>Навигация</h4>
            <ul className="footer-links">
              <li><Link to="/">Главная</Link></li>
              <li><Link to="/events">Мероприятия</Link></li>
              <li><Link to="/about">О проекте</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Помощь</h4>
            <ul className="footer-links">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Контакты</Link></li>
              <li><Link to="/privacy">Политика конфиденциальности</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Контакты</h4>
            <div className="footer-contacts">
              <p>
                <FaEnvelope /> support@cityevents.ru
              </p>
              <div className="footer-social">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <FaGithub />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Городские События. Все права защищены.</p>
          <p className="text-small">
            Разработано в соответствии с техническим заданием
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;