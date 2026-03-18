import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Minus } from 'lucide-react';
import './Styles/MenuItemModal.css';
import { useCart } from './CartContext';

const MenuItemModal = ({ item, addonGroups = [], onClose, onAddToCart }) => {
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [currentTotalPrice, setCurrentTotalPrice] = useState(0);
  const [totalTax, setTotalTax] = useState(0);

  // New state for Variations and Addons
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState({});

  // Reset state when item changes
  useEffect(() => {
    if (item?.itemallowvariation && item.variation?.length > 0) {
      // Auto-select first variation
      setSelectedVariation(item.variation[0]);
    } else {
      setSelectedVariation(null);
    }
    setSelectedAddons({});
    setQuantity(1);
  }, [item]);

  const handleVariationSelect = (variation) => {
    setSelectedVariation(variation);
  };

  const handleAddonToggle = (addonGroupId, addonItem, maxSelection, isRadio) => {
    setSelectedAddons(prev => {
      const groupAddons = prev[addonGroupId] || [];
      const isSelected = groupAddons.some(a => a.addonitemid === addonItem.addonitemid);
      
      if (isSelected) {
        // If radio, do not toggle off when clicking the selected one
        if (isRadio) return prev;
        return {
          ...prev,
          [addonGroupId]: groupAddons.filter(a => a.addonitemid !== addonItem.addonitemid)
        };
      } else {
        if (isRadio) {
          return { ...prev, [addonGroupId]: [addonItem] };
        }
        // Check maxSelection (0 means no limit typically, but let's assume if it exists and > 0 we enforce it)
        if (maxSelection > 0 && groupAddons.length >= maxSelection) {
          return prev;
        }
        return {
          ...prev,
          [addonGroupId]: [...groupAddons, addonItem]
        };
      }
    });
  };

  // Calculate total price with taxes
  const calculateTotalPrice = useCallback(() => {
    if (!item) return 0;
    
    let basePrice = item.price;
    if (item.itemallowvariation && selectedVariation) {
      basePrice = parseFloat(selectedVariation.price) || 0;
    } else if (item.itemallowvariation && !selectedVariation) {
      basePrice = 0;
    }
    
    let addonsTotal = 0;
    Object.values(selectedAddons).forEach(addonArray => {
      addonArray.forEach(addon => {
        addonsTotal += parseFloat(addon.addonitem_price) || 0;
      });
    });

    const priceBeforeTax = basePrice + addonsTotal;
    
    // Calculate tax amount
    let taxAmount = 0;
    if (item.taxes && item.taxes.length > 0) {
      taxAmount = item.taxes.reduce((sum, tax) => {
        return sum + (priceBeforeTax * tax.percentage / 100);
      }, 0);
    }
    
    setTotalTax(taxAmount);
    return (priceBeforeTax + taxAmount) * quantity;
  }, [item, quantity, selectedVariation, selectedAddons]);

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
    // Collect selected addons into an array
    const addon_items = [];
    Object.values(selectedAddons).forEach(groupAddons => {
      groupAddons.forEach(addon => {
        addon_items.push({
          addon_item_id: addon.addonitemid,
          quantity: 1, // Addons count as 1 typically
          name: addon.addonitem_name,
          price: parseFloat(addon.addonitem_price) || 0,
        });
      });
    });

    const orderItem = {
      ...item,
      quantity,
      finalPrice: currentTotalPrice,
      pricePerUnit: (currentTotalPrice / quantity), // Average price per unit overall
      timestamp: Date.now(),
      selectedCustomizations: {
        variation: selectedVariation ? {
          variation_id: selectedVariation.id,
          name: selectedVariation.name,
          price: parseFloat(selectedVariation.price) || 0
        } : null,
        addons: addon_items
      }
    };
    
    console.log('Adding to cart:', orderItem);
    onAddToCart(orderItem);
    addItem(orderItem); 
    onClose();
  };

  const isAddToCartDisabled = item.itemallowvariation && !selectedVariation;

  const basePrice = (item.itemallowvariation && selectedVariation) ? parseFloat(selectedVariation.price) || 0 : item.price;
  let addonsTotal = 0;
  Object.values(selectedAddons).forEach(addonArray => {
    addonArray.forEach(addon => {
      addonsTotal += parseFloat(addon.addonitem_price) || 0;
    });
  });
  
  const priceBeforeTax = basePrice + addonsTotal;
  const taxPerUnit = totalTax;
  const pricePerUnit = priceBeforeTax + taxPerUnit;
  const subtotal = priceBeforeTax * quantity;
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
            
            {/* Display tags */}
             <div className='price-count-container'>
              <div className="modal-tags">                  
                  <span className="price-highlight price-amount modal-tag">₹{pricePerUnit.toFixed(2)}</span>
                </div>
            
            
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
        </div>

        <div className="modal-body">
          {/* Variations Section */}
          {item.itemallowvariation && item.variation?.length > 0 && (
            <div className="modal-section modal-variations">
              <h3 className="section-title">Select Variation <span className="required-star">*</span></h3>
              <div className="variation-options">
                {item.variation.map(vr => (
                  <label key={vr.id} className={`variation-label ${selectedVariation?.id === vr.id ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="variation" 
                      value={vr.id} 
                      checked={selectedVariation?.id === vr.id}
                      onChange={() => handleVariationSelect(vr)}
                    />
                    <span className="variation-name">{vr.name}</span>
                    <span className="variation-price">₹{parseFloat(vr.price || 0).toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons Section */}
          {item.itemallowaddon && item.addon?.length > 0 && (
            <div className="modal-section modal-addons">
              {item.addon.map(addonDef => {
                const group = addonGroups.find(g => g.addongroupid === addonDef.addon_group_id);
                if (!group || !group.addongroupitems || group.addongroupitems.length === 0) return null;
                
                const minSel = parseInt(addonDef.addon_item_selection_min || 0);
                const maxSel = parseInt(addonDef.addon_item_selection_max || 0);
                const isRadio = maxSel === 1;

                return (
                  <div key={group.addongroupid} className="addon-group">
                    <h3 className="section-title">
                      {group.addongroup_name} 
                      {/* {maxSel > 0 && <span className="selection-hint">(Choose up to {maxSel})</span>} */}
                    </h3>
                    <div className="addon-options">
                      {group.addongroupitems.map(addonItem => {
                        const isSelected = selectedAddons[group.addongroupid]?.some(a => a.addonitemid === addonItem.addonitemid);
                        return (
                          <label key={addonItem.addonitemid} className={`addon-label ${isSelected ? 'selected' : ''}`}>
                            <input 
                              type={isRadio ? "radio" : "checkbox"} 
                              name={`addon-${group.addongroupid}`} 
                              checked={isSelected || false}
                              onChange={() => handleAddonToggle(group.addongroupid, addonItem, maxSel, isRadio)}
                              disabled={!isSelected && !isRadio && maxSel > 0 && (selectedAddons[group.addongroupid]?.length || 0) >= maxSel}
                            />
                            <span className="addon-name">{addonItem.addonitem_name}</span>
                            {parseFloat(addonItem.addonitem_price) > 0 && (
                               <span className="addon-price">₹{parseFloat(addonItem.addonitem_price).toFixed(2)}</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
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
                      ₹{(priceBeforeTax * tax.percentage / 100).toFixed(2)}
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
            <button onClick={handleAddToCartClick} className="add-to-cart-btn" disabled={isAddToCartDisabled}>
              Add 
              {/* {quantity} to Cart :  ₹{finalAmount.toFixed(2)} */}
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