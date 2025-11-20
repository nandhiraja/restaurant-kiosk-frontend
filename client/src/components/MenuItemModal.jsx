import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Minus } from 'lucide-react';
import './Styles/MenuItemModal.css';
import { useCart } from './CartContext';

const MenuItemModal = ({ item, onClose, onAddToCart }) => {
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [currentTotalPrice, setCurrentTotalPrice] = useState(0);
  const [totalTax, setTotalTax] = useState(0);

  // Calculate total price with taxes
  const calculateTotalPrice = useCallback(() => {
    const basePrice = item.price;
    
    // Calculate tax amount from the enriched taxes array
    let taxAmount = 0;
    if (item.taxes && item.taxes.length > 0) {
      taxAmount = item.taxes.reduce((sum, tax) => {
        return sum + (basePrice * tax.percentage / 100);
      }, 0);
    }
    
    setTotalTax(taxAmount);
    return (basePrice + taxAmount) * quantity;
  }, [item, quantity]);

  useEffect(() => {
    if (item) {
      setCurrentTotalPrice(calculateTotalPrice());
    }
  }, [item, calculateTotalPrice]);

  useEffect(() => {
    setQuantity(1);
  }, [item]);

  if (!item) return null;

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handleAddToCartClick = () => {
    const orderItem = {
      ...item,
      quantity,
      finalPrice: currentTotalPrice,
      pricePerUnit: item.price + totalTax,
      timestamp: Date.now(),
    };
    
    console.log('Adding to cart:', orderItem);
    onAddToCart(orderItem);
    addItem(orderItem); 
    onClose();
  };

  const basePrice = item.price;
  const taxPerUnit = totalTax;
  const pricePerUnit = basePrice + taxPerUnit;
  const subtotal = basePrice * quantity;
  const totalTaxAmount = taxPerUnit * quantity;
  const finalAmount = currentTotalPrice;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="modal-header-content">
            <h2 className="modal-title">{item.itemName}</h2>
            
            {/* Display tags
            {item.tags && item.tags.length > 0 && (
              <div className="modal-tags">
                {item.tags.map((tag, index) => (
                  <span key={index} className="modal-tag">{tag}</span>
                ))}
              </div>
            )} */}
            
            <div className="modal-item-info">
              <div className="modal-base-price">
                Base Price: ₹{basePrice.toFixed(2)}
              </div>
              {item.itemNature && (
                <div className="modal-item-nature">
                  Type: {item.itemNature}
                </div>
              )}
              {item.skuCode && (
                <div className="modal-sku">
                  SKU: {item.skuCode}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">

          {/* Price per unit */}
          <div className="modal-section">
            <div className="price-per-unit">
              <span>Price per unit (incl. tax):</span>
              <span className="price-highlight">₹{pricePerUnit.toFixed(2)}</span>
            </div>
          </div>

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
       

          
          
          {/* Tax Breakdown Section */}
          {item.taxes && item.taxes.length > 0 && (
            <div className="modal-section">
              <h3 className="section-title">Tax Information</h3>
              <div className="tax-details">
                {item.taxes.map((tax, index) => (
                  <div key={index} className="tax-item">
                    <span className="tax-name">{tax.name}</span>
                    <span className="tax-rate">{tax.percentage}%</span>
                    <span className="tax-amount">
                      ₹{(basePrice * tax.percentage / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="tax-item total-tax">
                  <span className="tax-name">Total Tax per unit</span>
                  <span className="tax-amount">₹{taxPerUnit.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="price-breakdown">
            <div className="price-row">
              <span>Base Amount ({quantity} × ₹{basePrice.toFixed(2)}):</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Total Tax:</span>
              <span>₹{totalTaxAmount.toFixed(2)}</span>
            </div>
            <div className="price-row total">
              <span>Final Amount:</span>
              <span>₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="footer-actions">
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button onClick={handleAddToCartClick} className="add-to-cart-btn">
              Add {quantity} to Cart - ₹{finalAmount.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

MenuItemModal.propTypes = {
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
    tags: PropTypes.arrayOf(PropTypes.string),
    taxes: PropTypes.arrayOf(PropTypes.shape({
      taxTypeId: PropTypes.string,
      name: PropTypes.string,
      percentage: PropTypes.number
    })),
    taxAmount: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired,
};

export default MenuItemModal;
