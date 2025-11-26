import './Styles/Navigation.css';
import { ShoppingCart, Home } from 'lucide-react';
import React from 'react';
import { useNavigate } from "react-router-dom";
import { useCart } from './CartContext';
import { IoMdArrowRoundBack } from "react-icons/io";

const Navigation = ({ categoryName, orderType }) => {
  const navigate = useNavigate();
  const { cart } = useCart();

  const handleCartClick = () => {
    navigate('/cart'); // Route to cart page instead of modal
  };

  const handleBack = () => {
    navigate('/dinein');
  };

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        <button className="nav-btn home-btn" onClick={handleBack}>
          <IoMdArrowRoundBack size={20} />
          <span className="nav-label">Menu</span>
        </button>
        
        <div className="nav-center">
          <h1 className="category-title">{categoryName || 'MENU'}</h1>
          {orderType && (
            <span className="order-type-pill">{orderType}</span>
          )}
        </div>
        
        <button className="nav-btn cart-btn" onClick={handleCartClick}>
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
  );
}

export default Navigation;
