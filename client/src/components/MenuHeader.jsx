import React, { useState } from 'react';
import { ShoppingCart, Home, ChevronDown, ChevronUp } from 'lucide-react';
import CartPage from './CartPage'; // or import your CartPage if it is styled as a modal
import './Styles/MenuHeader.css';

const categories = ["Indian", "Italian", "Chinese", "Desserts", "Beverages", "Indian", "Italian", "Chinese", "Desserts", "Beverages", "Indian", "Italian", "Chinese", "Desserts", "Beverages"];

const MenuHeader = () => {
  const [activeCategory, setActiveCategory] = useState("Indian");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCart, setShowCart] = useState(false);    // <-- Add this state

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    console.log(`Switching to category: ${category}`);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCartClick = () => {
    setShowCart(true);
  };

  const handleCartClose = () => {
    setShowCart(false);
  };

  return (
    <header className="menu-header">
      {/* Top Bar */}
     

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
                <ChevronUp size={10} />
              </>
            ) : (
              <>
                <ChevronDown size={10} />
              </>
            )}
          </button>
        )}
      </div>
      <div className="header-divider"></div>

      {/* Cart Modal/Page */}
      {showCart && (
        <CartPage onClose={handleCartClose} />
      )}
    </header>
  );
};

export default MenuHeader;
