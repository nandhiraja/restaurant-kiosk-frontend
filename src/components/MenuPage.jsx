import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Styles/MenuPage.css';
import { IoMdArrowRoundBack } from "react-icons/io";
import MenuSkeleton from './MenuSkeleton'; 
const BASE_URL = import.meta.env.VITE_Base_url;

const MenuPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderType = location.state?.orderType || 'dine-in';
  
  const [allMenuData, setAllMenuData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);




  const handleCardClick = (category) => {
    const categoryItems = allMenuData.items.filter(
      item => item.categoryId === category.categoryId
    );
    
    navigate(`/item/${category.categoryId}`, { 
      state: { 
        category,
        items: categoryItems,
        itemTags: allMenuData.itemTags,
        taxTypes: allMenuData.taxTypes,
        charges: allMenuData.charges,
        discounts: allMenuData.discounts,
        orderType 
      } 
    });
  };

  const handleBackClick = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        console.log("Fetching category data from backend...", BASE_URL);
        
        const response = await fetch(`${BASE_URL}/catalog/?channel=Palas Kiosk`, {
          headers: {
            "ngrok-skip-browser-warning": "true"
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAllMenuData(data);
        setCategories(data.categories || []);
        console.log("Menu data received:", data);
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

   if (loading) {
    return <MenuSkeleton />;
  }

if (error) {
  return (
    <div className="menu-container">
      <div className="menu-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <IoMdArrowRoundBack size={30}/>
        </button>
        <h1 className="nav-title">Menu</h1>
      </div>
      
      <div className="error-state-container">
        <div className="error-card">
          {/* <div className="error-icon">⚠️</div> */}
          <h2 className="error-title">Unable to Load Menu</h2>
          <p className="error-message">{error}</p>
          
          <div className="error-actions">
            <button 
              className="retry-button" 
              onClick={() => window.location.reload()}
            >
              <span></span>
              Try Again
            </button>
            
            <button 
              className="back-home-button" 
              onClick={() => navigate('/')}
            >
              <span></span>
              Back to Home
            </button>
          </div>
          
          <p className="error-hint">
            Please check your internet connection or contact staff for assistance
          </p>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="menu-container">
      {/* Header Section */}
      <header className="nav-header">
        <button 
          className="back-button" 
          onClick={handleBackClick}
          aria-label="Go back to order type selection"
        >
          <IoMdArrowRoundBack size={30} />
        </button>
        <h1 className="nav-title">Category</h1>
      </header>

      {/* Menu Grid */}
      <main className="menu-grid">
        {categories.length > 0 ? (
          categories.map((category) => (
            <article
              key={category.categoryId} 
              className="menu-card"
              onClick={() => handleCardClick(category)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCardClick(category);
                }
              }}
            >
              <div className="card-inner">
                <img 
                  src={ category.imageURL || `./Menu/${category.name}.jpg`}
                  alt={`${category.name} category`}
                  className="card-image"
                  onError={(e) => {
                    e.target.src = './placeholder.jpg';
                  }}
                  loading="lazy"
                />
                <div className="card-label">
                  <div className="card-label-inner">
                    <span className="card-title">{category.name}</span>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <p>No categories available</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;
