import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Minus } from 'lucide-react';
import './Styles/menuItemModal.css';

const TAX_RATE = 0.05; // 5% tax

const MenuItemModal = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});
  const [currentTotalPrice, setCurrentTotalPrice] = useState(0);

  // Initialize selected customizations
  useEffect(() => {
    if (item && item.customizations) {
      const initialCustoms = {};
      item.customizations.forEach(custom => {
        if (custom.type === 'radio' && custom.options.length > 0) {
          initialCustoms[custom.id] = custom.options[0].value;
        } else if (custom.type === 'checkbox' || custom.type === 'multiple') {
          initialCustoms[custom.id] = []; // Array for multiple selections
        }
      });
      setSelectedCustomizations(initialCustoms);
    }
    setSelectedAddons({});
    setQuantity(1);
  }, [item]);

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    let basePrice = item.price;

    // Add customization price impacts
    item.customizations.forEach(custom => {
      if (custom.type === 'radio') {
        const selectedOptionValue = selectedCustomizations[custom.id];
        if (selectedOptionValue) {
          const option = custom.options.find(opt => opt.value === selectedOptionValue);
          if (option && typeof option.price_impact === 'number') {
            basePrice += option.price_impact;
          }
        }
      } else if (custom.type === 'checkbox' || custom.type === 'multiple') {
        // Handle multiple selections
        const selectedValues = selectedCustomizations[custom.id] || [];
        selectedValues.forEach(value => {
          const option = custom.options.find(opt => opt.value === value);
          if (option && typeof option.price_impact === 'number') {
            basePrice += option.price_impact;
          }
        });
      }
    });

    // Add addon prices
    Object.keys(selectedAddons).forEach(addonId => {
      if (selectedAddons[addonId]) {
        const addon = item.addons.find(a => a.id === addonId);
        if (addon) {
          basePrice += addon.price;
        }
      }
    });

    return basePrice * quantity;
  }, [item, quantity, selectedCustomizations, selectedAddons]);

  useEffect(() => {
    if (item) {
      setCurrentTotalPrice(calculateTotalPrice());
    }
  }, [item, calculateTotalPrice]);

  if (!item) return null;

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handleCustomizationChange = (customId, value, type) => {
    if (type === 'radio') {
      setSelectedCustomizations(prev => ({ ...prev, [customId]: value }));
    } else if (type === 'checkbox' || type === 'multiple') {
      // Handle multiple selections
      setSelectedCustomizations(prev => {
        const currentSelections = prev[customId] || [];
        const isSelected = currentSelections.includes(value);
        
        if (isSelected) {
          // Remove the value
          return { ...prev, [customId]: currentSelections.filter(v => v !== value) };
        } else {
          // Add the value
          return { ...prev, [customId]: [...currentSelections, value] };
        }
      });
    }
  };

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev => ({ ...prev, [addonId]: !prev[addonId] }));
  };

  const handleAddToCartClick = () => {
    const orderItem = {
      ...item,
      quantity,
      selectedCustomizations,
      selectedAddons,
      finalPrice: currentTotalPrice,
      timestamp: Date.now(),
    };
    onAddToCart(orderItem);
    onClose();
  };

  const totalBeforeTax = currentTotalPrice;
  const taxAmount = totalBeforeTax * TAX_RATE;
  const finalAmountWithTax = totalBeforeTax + taxAmount;

  const isOptionSelected = (customId, value, type) => {
    if (type === 'radio') {
      return selectedCustomizations[customId] === value;
    } else if (type === 'checkbox' || type === 'multiple') {
      const selections = selectedCustomizations[customId] || [];
      return selections.includes(value);
    }
    return false;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="modal-header-content">
            <h2 className="modal-title">{item.name}</h2>
            <p className="modal-description">{item.description}</p>
            <div className="modal-base-price">Base Price: ₹{item.price.toFixed(2)}</div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          
          {/* Customizations Section */}
          {item.customizations && item.customizations.length > 0 && (
            <div className="modal-section">
              <h3 className="section-title">Customize Your Order</h3>
              {item.customizations.map(custom => (
                <div key={custom.id} className="customization-group">
                  <p className="customization-label">
                    {custom.name}
                    {(custom.type === 'checkbox' || custom.type === 'multiple') && 
                      <span className="multiple-indicator">(Select multiple)</span>
                    }
                  </p>
                  <div className="options-grid">
                    {custom.options.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleCustomizationChange(custom.id, option.value, custom.type)}
                        className={`option-btn ${isOptionSelected(custom.id, option.value, custom.type) ? 'selected' : ''}`}
                      >
                        <span className="option-label">{option.label}</span>
                        {option.price_impact !== 0 && (
                          <span className="option-price">
                            {option.price_impact > 0 ? '+' : ''}₹{option.price_impact.toFixed(2)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add-ons Section */}
          {item.addons && item.addons.length > 0 && (
            <div className="modal-section">
              <h3 className="section-title">Add Extra Items</h3>
              <div className="addons-list">
                {item.addons.map(addon => (
                  <label key={addon.id} className="addon-item">
                    <div className="addon-info">
                      <span className="addon-name">{addon.name}</span>
                      <span className="addon-price">+₹{addon.price.toFixed(2)}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!selectedAddons[addon.id]}
                      onChange={() => handleAddonToggle(addon.id)}
                      className="addon-checkbox"
                    />
                    <span className="checkbox-custom"></span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="modal-section">
            <h3 className="section-title">Quantity</h3>
            <div className="quantity-selector">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="quantity-btn"
                disabled={quantity <= 1}
              >
                <Minus size={20} />
              </button>
              <span className="quantity-display">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="quantity-btn"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal:</span>
              <span>₹{totalBeforeTax.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Tax ({TAX_RATE * 100}%):</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="price-row total">
              <span>Total:</span>
              <span>₹{finalAmountWithTax.toFixed(2)}</span>
            </div>
          </div>
          <div className="footer-actions">
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button onClick={handleAddToCartClick} className="add-to-cart-btn">
              Add to Cart - ₹{finalAmountWithTax.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

MenuItemModal.propTypes = {
  item: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired,
};

export default MenuItemModal;
