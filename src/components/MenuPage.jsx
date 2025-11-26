import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Styles/MenuPage.css';
import { IoMdArrowRoundBack } from "react-icons/io";

const BASE_URL = import.meta.env.VITE_Base_url;

const MenuPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderType = location.state?.orderType || 'dine-in';
  
  const [allMenuData, setAllMenuData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
    console.log("Fetching category data from backend...", BASE_URL);
    
    fetch(`${BASE_URL}/catalog/?channel=Palas Kiosk`, {
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    })
      .then(async (response) => {
        let raw = await response.text();
        console.log("Status:", response.status, raw);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await JSON.parse(raw);
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
          <IoMdArrowRoundBack size={30}/>
        </button>
        <h1 className="menu-title">Menu</h1>
      </div>

      {/* Menu Grid */}
      <div className="menu-grid">
        {categories.map((category) => (
          <div 
            key={category.categoryId} 
            className="menu-card"
            onClick={() => handleCardClick(category)}
          >
            <div className="card-inner">
              <img 
                src={`./Menu/${category.name}.jpg` || './placeholder_dosa.jpg'}
                alt={category.name}
                className="card-image"
                onError={(e) => {
                  e.target.src = './placeholder.jpg';
                }}
              />
              <div className="card-label">
                 <div className="card-label-inner">
                <span className="card-title">{category.name}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
