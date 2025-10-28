import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, ShoppingBag, Clock, MapPin } from 'lucide-react';
import './Styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleDineIn = () => {
    navigate('/dinein');
  };

  const handleTakeOut = () => {
    navigate('/dinein'); // You can create a separate route if needed
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="brand-name">NK Restaurant</h1>
          <p className="tagline">Authentic Flavors, Memorable Experiences</p>
          <div className="accent-line"></div>
        </div>
      </div>

      {/* Main Selection */}
      <div className="selection-container">
        <h2 className="selection-title">How would you like to order?</h2>
        
        <div className="order-options">
          {/* Dine In Option */}
          <button className="order-card dine-in" onClick={handleDineIn}>
            <div className="card-icon">
              <Utensils size={48} />
            </div>
            <h3 className="card-title">Dine In</h3>
            <p className="card-description">
              Enjoy your meal in our cozy restaurant
            </p>
            <div className="card-arrow">→</div>
          </button>

          {/* Take Out Option */}
          <button className="order-card take-out" onClick={handleTakeOut}>
            <div className="card-icon">
              <ShoppingBag size={48} />
            </div>
            <h3 className="card-title">Take Out</h3>
            <p className="card-description">
              Quick pickup for on-the-go dining
            </p>
            <div className="card-arrow">→</div>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-card">
          <Clock size={24} />
          <div className="info-text">
            <p className="info-label">Open Daily</p>
            <p className="info-value">11:00 AM - 10:00 PM</p>
          </div>
        </div>
        <div className="info-card">
          <MapPin size={24} />
          <div className="info-text">
            <p className="info-label">Location</p>
            <p className="info-value">123 Food Street, City</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p>Touch a button above to start ordering</p>
      </footer>
    </div>
  );
};

export default HomePage;
