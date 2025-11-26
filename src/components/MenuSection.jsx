import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import MenuItemCard from './MenuItemCard';
import MenuItemModal from './MenuItemModal';
import Navigation from './NavigationBar';
import NotificationToast from './Notification';
import './Styles/MenuSection.css';

const MenuSection = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  const {
    category,
    items = [],
    itemTags = [],
    taxTypes = [],
    orderType = 'dine-in'
  } = state || {};

  const getItemTags = (itemTagIds = []) => {
    return itemTagIds.map(tagId => {
      const tag = itemTags.find(t => t.itemTagId === tagId);
      return tag ? tag.name : '';
    }).filter(Boolean);
  };

  const getItemTaxes = (taxTypeIds = []) => {
    return taxTypeIds.map(taxId => {
      const tax = taxTypes.find(t => t.taxTypeId === taxId);
      return tax;
    }).filter(Boolean);
  };

  const enrichedItems = items.map(item => ({
    ...item,
    tags: getItemTags(item.itemTagIds),
    taxes: getItemTaxes(item.taxTypeIds),
    taxAmount: item.taxTypeIds ? 
      item.taxTypeIds.reduce((sum, taxId) => {
        const tax = taxTypes.find(t => t.taxTypeId === taxId);
        return sum + (tax ? (item.price * tax.percentage / 100) : 0);
      }, 0) : 0
  }));
  console.log(items, enrichedItems)
  const openModalWithItem = (item) => {
    setSelectedMenuItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMenuItem(null);
  };

  const handleAddToCart = (itemWithCustomizations) => {
    console.log("Adding to cart:", itemWithCustomizations);
    setShowNotification(true);
  };

  if (!state) {
    return (
      <div className="menu-section-container">
        <Navigation />
        <div className="error-message">
          <p>No data available. Please go back and select a category.</p>
          <button onClick={() => navigate('/dinein')}>Back to Menu</button>
        </div>
      </div>
    );
  }

  // Format order type for display
  const orderTypeDisplay = orderType === 'dine-in' ? 'Dine In' : 'Take Away';

  return (
    <div className="menu-section-container">
      {/* Navigation with category name and order type */}
      <Navigation 
        categoryName={category?.name} 
        orderType={orderTypeDisplay}
      />

      {/* Menu Items Grid */}
      <main className="menu-main-content">
        <div className="menu-items-grid">
          {enrichedItems.length > 0 ? (
            enrichedItems.map((item) => (
              <MenuItemCard 
                key={item.itemId} 
                item={item} 
                onAddClick={openModalWithItem} 
              />
            ))
          ) : (
            <div className="no-items">
              <p>No items available in this category.</p>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && selectedMenuItem && (
        <MenuItemModal 
          item={selectedMenuItem} 
          onClose={closeModal} 
          onAddToCart={handleAddToCart}
        />
      )}

      <NotificationToast
        message="Successfully added to cart!"
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
{/* 
      <footer className="menu-footer">
        <div className="footer-content">
          <p className="footer-text">Explore our delicious menu</p>
          <div className="footer-decorative-line"></div>
        </div>
      </footer> */}
    </div>
  );
};

export default MenuSection;
