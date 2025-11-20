import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Styles/MenuPage.css';
import { IoMdArrowRoundBack } from "react-icons/io";

const BASE_URL = import.meta.env.VITE_Base_url;

const MenuPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderType = location.state?.orderType || 'dine-in';
  
  const [allMenuData, setAllMenuData] = useState(null); // Store entire response
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCardClick = (category) => {
    // Filter items for this category
    const categoryItems = allMenuData.items.filter(
      item => item.categoryId === category.categoryId
    );
    
    // Navigate with all necessary data
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
    console.log("Fetching category data from backend...", BASE_URL);
    
    fetch(`${BASE_URL}/catalog/?channel=Palas Kiosk`, {
     headers: {
       "ngrok-skip-browser-warning": "true"
     }
      })
      .then(async (response) => {
        let raw = await response.text();
        console.log("Status:", response.status ,raw);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await JSON.parse(raw);
        
        // Store all data
        setAllMenuData(data);
        setCategories(data.categories);
        setLoading(false);
        
        console.log("Menu data received:", data);
      })
      .catch((err) => {
        console.error("Error fetching category data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="menu-container"><p>Loading menu...</p></div>;
  }

  return (
    <div className="menu-container">
      {/* Header Section */}
      <div className="menu-header">
        <button className="back-button" onClick={handleBackClick}>
          <IoMdArrowRoundBack/>
        </button>
        <h1 className="menu-title">Menu</h1>
        <div className="order-type-badge">
          {orderType === 'dine-in' ? 'Dine In' : 'Take Away'}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="menu-grid">
        {categories.map((category) => (
          <div 
            key={category.categoryId} 
            className="menu-card"
            onClick={() => handleCardClick(category)}
          >
            <div className="card-image-wrapper">
              <img 
                src={category.imageUrl ||  './placeholder_dosa.jpg'}
                alt={category.name}
                className="card-image"
                onError={(e) => {
                  e.target.src = 'https://www.google.com/imgres?q=doasa%20image&imgurl=https%3A%2F%2Fvismaifood.com%2Fstorage%2Fapp%2Fuploads%2Fpublic%2F8b4%2F19e%2F427%2Fthumb__1200_0_0_0_auto.jpg&imgrefurl=https%3A%2F%2Fvismaifood.com%2Fmysore-masala-dosa-recipe-crispy-masala-dosa-how-make-perfect-mysore-masala-dosa-batter-home&docid=hydnzhElP7bPeM&tbnid=CK3DIoAZ3EOW1M&vet=12ahUKEwjQwreR8f-QAxVr1DgGHe8DAKcQM3oECBoQAA..i&w=1200&h=800&hcb=2&ved=2ahUKEwjQwreR8f-QAxVr1DgGHe8DAKcQM3oECBoQAA'; // Fallback image
                }}
              />
              <div className="card-overlay"></div>
            </div>
            <div className="card-content">
              <h3 className="card-title">{category.name}</h3>
            </div>
          </div>
        ))}
      </div>

      <footer className="menu-footer">
        <div className="footer-content">
          <p className="footer-text">Scroll to explore more delicious items</p>
          <div className="footer-decorative-line"></div>
        </div>
      </footer>
    </div>
  );
};

export default MenuPage;
