import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/landingpage.css';

const LandingPage = () => {
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();

  const handleOrderClick = (orderType) => {
    // Navigate to menu page with order type
     navigate('/dinein', { state: { orderType } });
  };

  return (
    <div className="kiosk-container">
      {/* Corner Decorative Icons */}
      <div className="corner-icon top-left">
        <img 
          src={`TOP_LEFT.png`}
          alt="Corner decoration" 
          onError={(e) => {
            e.target.style.display = 'none';
            console.log('Top left image failed to load');
          }}
        />
      </div>
      <div className="corner-icon top-right">
        <img 
          src={`TOP_RIGHT.png`}
          alt="Corner decoration" 
          onError={(e) => {
            e.target.style.display = 'none';
            console.log('Top right image failed to load');
          }}
        />
      </div>
      <div className="corner-icon bottom-left">
        <img 
          src={`BOTTOM_LEFT.png`}
          alt="Corner decoration" 
          onError={(e) => {
            e.target.style.display = 'none';
            console.log('Bottom left image failed to load');
          }}
        />
      </div>
      <div className="corner-icon bottom-right">
        <img 
          src={`BOTTOM_RIGHT.png`}
          alt="Corner decoration" 
          onError={(e) => {
            e.target.style.display = 'none';
            console.log('Bottom right image failed to load');
          }}
        />
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-illustration">
            <img 
              src={`CenterImage_LOGO.png`}
              alt="Restaurant icon" 
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x300?text=Logo';
                console.log('Logo image failed to load');
              }}
            />
          </div>
        </div>

        {/* Restaurant Name */}
        <h1 className="restaurant-name">Sawagata</h1>

        {/* Rating Stars */}
        <div className="rating-stars">
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="star">★</span>
        </div>

        {/* Order Section */}
        <div className="order-section">
          <h2 className="order-title">PLACE ORDER</h2>
          
          <div className="button-container">
            <button 
              className={`order-button ${activeButton === 'having' ? 'active' : ''}`}
              onMouseEnter={() => setActiveButton('having')}
              onMouseLeave={() => setActiveButton(null)}
              onClick={() => handleOrderClick('dine-in')}
            >
              <span className="button-text">Having it here</span>
              <span className="button-shine"></span>
            </button>
            
            <button 
              className={`order-button ${activeButton === 'takeaway' ? 'active' : ''}`}
              onMouseEnter={() => setActiveButton('takeaway')}
              onMouseLeave={() => setActiveButton(null)}
              onClick={() => handleOrderClick('takeaway')}
            >
              <span className="button-text">Take Away</span>
              <span className="button-shine"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
