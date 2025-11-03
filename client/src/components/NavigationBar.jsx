import './Styles/Navigation.css';
import { ShoppingCart, Home } from 'lucide-react';
import React, { useState } from 'react';
import CartPage from './CartPage';
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from './CartContext';

const Navigation = ({ categoryName, orderType }) => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [showCart, setShowCart] = useState(false);

  const handleCartClick = () => {
    setShowCart(true);
  };

  const handleCartClose = () => {
    setShowCart(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className="navigation-bar">
        <div className="nav-container">
          {/* Left: Home Button */}
          <button className="nav-btn home-btn" onClick={handleBack} aria-label="Go to home">
            <Home size={20} />
            <span className="nav-label">Home</span>
          </button>
          
          {/* Center: Category Name & Order Type */}
          <div className="nav-center">
            <h1 className="category-title">{categoryName || 'MENU'}</h1>
            {orderType && (
              <span className="order-type-pill">{orderType}</span>
            )}
          </div>
          
          {/* Right: Cart Button */}
          <button className="nav-btn cart-btn" onClick={handleCartClick} aria-label="View cart">
            <div className="cart-icon-wrapper">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </div>
            <span className="nav-label">Cart</span>
          </button>
        </div>
      </nav>

      {/* Cart Modal */}
      {showCart && (
        <div className="cart-modal-overlay">
          <CartPage onClose={handleCartClose} />
        </div>
      )}
    </>
  );
}

export default Navigation;
