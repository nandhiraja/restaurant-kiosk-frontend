import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Styles/MenuItemCard.css';

const MenuItemCard = ({ item, onAddClick }) => {
  const { 
    itemName, 
    price, 
    tags = [], 
    taxes = [], 
    taxAmount = 0,
    imageURL,
    itemNature,
    skuCode 
  } = item;

  // State to manage image source with fallback logic
  const [imgSrc, setImgSrc] = useState(imageURL || '/placeholder.jpg');
  const [imageError, setImageError] = useState(false);

  // Calculate total price including taxes
  const totalPrice = price + taxAmount;

  // Handle image load error
  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImgSrc('/placeholder.jpg');
    }
  };

  // Determine if item is vegetarian/non-vegetarian from tags
  const isVeg = tags.some(tag => 
    tag.toLowerCase().includes('vegetarian') || tag.toLowerCase() === 'veg'
  );
  const isNonVeg = tags.some(tag => 
    tag.toLowerCase().includes('non-vegetarian') || tag.toLowerCase() === 'non-veg'
  );

  return (
    <div className="menu-item-card">
      {/* Item Image - placeholder or from external source */}
      <div className="item-image-container">
        <img
          className="item-image"
          src={imgSrc}
          alt={itemName}
          loading="lazy"
          onError={handleImageError}
        />
        <div className="image-overlay"></div>
        
        {/* Veg/Non-Veg indicator */}
        {(isVeg || isNonVeg) && (
          <div className={`food-type-badge ${isVeg ? 'veg' : 'non-veg'}`}>
            <span className="food-indicator"></span>
          </div>
        )}
      </div>
      
      {/* Item Details and Action */}
      <div className="item-content">
        <div className="item-details">
          <h3 className="item-name">{itemName}</h3>
        </div>
        
        <div className="item-footer">
          <div className="price-container">
            <span className="item-price">
              <span className="currency-symbol">₹</span>
              {price.toFixed(2)}
            </span>
            
            {taxAmount > 0 && (
              <span className="tax-info">
                + ₹{taxAmount.toFixed(2)} tax
              </span>
            )}
            
            {taxAmount > 0 && (
              <span className="total-price">
                Total: ₹{totalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <button 
            className="add-btn" 
            onClick={() => onAddClick(item)}
            aria-label={`Add ${itemName} to cart`}
          >
            <span className="add-btn-text">Add</span>
          </button>
        </div>
        
        {taxes.length > 0 && (
          <div className="tax-breakdown">
            {taxes.map((tax, index) => (
              <span key={index} className="tax-detail">
                {tax.name} ({tax.percentage}%)
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

MenuItemCard.propTypes = {
  item: PropTypes.shape({
    itemId: PropTypes.string.isRequired,
    itemName: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    itemNature: PropTypes.string,
    categoryId: PropTypes.string.isRequired,
    skuCode: PropTypes.string,
    status: PropTypes.string,
    measuringUnit: PropTypes.string,
    itemTagIds: PropTypes.arrayOf(PropTypes.string),
    taxTypeIds: PropTypes.arrayOf(PropTypes.string),
    imageURL: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    taxes: PropTypes.arrayOf(PropTypes.shape({
      taxTypeId: PropTypes.string,
      name: PropTypes.string,
      percentage: PropTypes.number
    })),
    taxAmount: PropTypes.number,
  }).isRequired,
  onAddClick: PropTypes.func.isRequired,
};

export default MenuItemCard;
