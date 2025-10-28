import React from 'react';
import PropTypes from 'prop-types';
import './Styles/MenuItemCard.css';
// import {pic} from '../../public/Images/biryani-rice-dish.jpg'
// import './Images/biryani-rice-dish.jpg'

/**
 * A reusable card component to display a single menu item.
 * @param {object} item - The menu item object.
 */
const MenuItemCard = ({ item ,onAddClick}) => {
  const { name, description, price, imageSrc } = item;

  return (
    <div className="menu-item-card">
      {/* Item Image */}
      <div className="item-image-container">
        <img
          className="item-image"
          src={imageSrc}
          alt={name}
          loading="lazy"
        />
        <div className="image-overlay"></div>
      </div>
      
      {/* Item Details and Action */}
      <div className="item-content">
        <div className="item-details">
          {/* Item Name */}
          <h3 className="item-name">{name}</h3>
          
          {/* Item Description */}
          <p className="item-description">{description}</p>
        </div>
        
        {/* Price and Add Button */}
        <div className="item-footer">
          {/* Price */}
          <span className="item-price">
            <span className="currency-symbol">₹</span>
            {price.toFixed(2)}
          </span>
          
          {/* Add Button */}
          <button className="add-btn" onClick={() => onAddClick(item)}>
            <span className="add-btn-text">Add</span>
            <span className="add-btn-icon">+</span>
          </button>
        </div>
      </div>
    </div>
  );
};

MenuItemCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    imageSrc: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    customizations: PropTypes.array, // Added optional customizations
    addons: PropTypes.array,         // Added optional addons
  }).isRequired,
  onAddClick: PropTypes.func.isRequired, // Prop for opening the modal
};

export default MenuItemCard;
