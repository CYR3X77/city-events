import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Исправляем иконки маркеров Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function Map({ latitude, longitude, title, address }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Инициализация карты
    const map = L.map(mapRef.current).setView([latitude, longitude], 15);

    // Добавляем слой карты OpenStreetMap (бесплатная альтернатива Google Maps)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Добавляем маркер
    const marker = L.marker([latitude, longitude]).addTo(map);
    
    // Добавляем popup с информацией
    if (title || address) {
      marker.bindPopup(`
        <div class="map-popup">
          ${title ? `<strong>${title}</strong>` : ''}
          ${address ? `<p>${address}</p>` : ''}
        </div>
      `).openPopup();
    }

    mapInstanceRef.current = map;

    // Очистка при размонтировании
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, title, address]);

  // Обновление позиции при изменении координат
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 15);
    }
  }, [latitude, longitude]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map"></div>
      <div className="map-footer">
        <a 
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="map-link"
        >
          Открыть на большой карте
        </a>
      </div>
    </div>
  );
}

export default Map;