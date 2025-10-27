import React, { useState } from 'react';
import { ShoppingCart, Home, ChevronDown, ChevronUp } from 'lucide-react';
import './Styles/menuHeader.css';

const categories = ["Indian", "Italian", "Chinese", "Desserts", "Beverages", "Indian", "Italian", "Chinese", "Desserts", "Beverages", "Indian", "Italian", "Chinese", "Desserts", "Beverages"];

const MenuHeader = () => {
  const [activeCategory, setActiveCategory] = useState("Indian");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    console.log(`Switching to category: ${category}`);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <header className="menu-header">
      {/* Top Bar */}
      <div className="header-top">
        <div className="header-title-section">
          <h1 className="menu-title">Menu</h1>
          <p className="menu-subtitle">
            <span className="subtitle-accent">~</span> Take Away
          </p>
        </div>
        
        {/* Utility Buttons */}
        <div className="header-actions">
          <button className="action-btn home-btn">
            <Home size={18} />
          </button>
          <button className="action-btn cart-btn">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="category-container">
        <nav className={`category-navigation ${isExpanded ? 'expanded' : 'collapsed'}`}>
          {categories.map((category, index) => (
            <button
              key={`${category}-${index}`}
              onClick={() => handleCategoryClick(category)}
              className={`category-btn ${activeCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </nav>
        {/* Expand/Collapse Button */}
        {categories.length > 8 && (
          <button className="expand-toggle-btn" onClick={toggleExpanded}>
            {isExpanded ? (
              <>
                {/* <span>Show L</span> */}
                <ChevronUp size={10} />
              </>
            ) : (
              <>
                {/* <span>More Categories</span> */}
                <ChevronDown size={10} />
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="header-divider"></div>
    </header>
  );
};

export default MenuHeader;
