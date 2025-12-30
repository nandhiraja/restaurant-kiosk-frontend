import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/landingpage.css';
import { useCart } from './CartContext';

const LandingPage = () => {
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const handleOrderClick = (orderType) => {
    localStorage.setItem('orderType', orderType);
    navigate('/category', { state: { orderType } });
  };

  useEffect(() => {
    clearCart();
    localStorage.removeItem('restaurantCart');
    localStorage.removeItem('orderType');
    console.log('Cart cleared - Fresh start for new customer');
  }, []);

  const cornerImages = [
    { position: 'top-left', src: 'TOP_LEFT.png', alt: 'Top left decoration' },
    { position: 'top-right', src: 'TOP_RIGHT.png', alt: 'Top right decoration' },
    { position: 'bottom-left', src: 'BOTTOM_LEFT.png', alt: 'Bottom left decoration' },
    { position: 'bottom-right', src: 'BOTTOM_RIGHT.png', alt: 'Bottom right decoration' }
  ];

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  return (
    <div className="kiosk-container">
      {/* Corner Decorative Icons */}
      {cornerImages.map(({ position, src, alt }) => (
        <div key={position} className={`corner-icon ${position}`}>
          <img src={src} alt={alt} onError={handleImageError} />
        </div>
      ))}

      {/* Main Content */}
      <main className="content-wrapper">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-illustration">
            <img 
              src="Center-Image-Logo.svg"
              alt="Sawagata Restaurant Logo" 
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x300?text=Logo';
              }}
            />
          </div>
        </div>

        {/* Restaurant Name */}
        <h1 className="restaurant-name">Sawagata</h1>

        {/* Rating Stars */}
        <div className="rating-stars" role="img" aria-label="5 star rating">
          {[...Array(5)].map((_, index) => (
            <span key={index} className="star">
              <img src="Star-flower.svg" alt="" />
            </span>
          ))}
        </div>

        {/* Order Section */}
        <section className="order-section">
          <h2 className="order-title">PLACE ORDER</h2>
          
          <div className="button-container">
            <button 
              className={`order-button ${activeButton === 'having' ? 'active' : ''}`}
              onMouseEnter={() => setActiveButton('having')}
              onMouseLeave={() => setActiveButton(null)}
              onClick={() => handleOrderClick('dine-in')}
              aria-label="Order for dining in"
            >
              <span className="button-text">Having it here</span>
              <span className="button-shine" aria-hidden="true"></span>
            </button>
            
            <button 
              className={`order-button ${activeButton === 'takeaway' ? 'active' : ''}`}
              onMouseEnter={() => setActiveButton('takeaway')}
              onMouseLeave={() => setActiveButton(null)}
              onClick={() => handleOrderClick('takeaway')}
              aria-label="Order for takeaway"
            >
              <span className="button-text">Take Away</span>
              <span className="button-shine" aria-hidden="true"></span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
