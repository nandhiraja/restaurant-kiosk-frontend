import React from 'react';
import MenuHeader from './MenuHeader';
import MenuItemCard from './MenuItemCard';
import { menuItems } from '../Datas/metadatas';
import  { useState } from 'react';
import MenuItemModal from './MenuItemModal';
import './Styles/MenuSection.css';
import  Navigation  from './NavigationBar';
/**
 * The main component for the entire menu page.
 * It combines the header and the grid of menu item cards.
 */
const MenuSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [cart, setCart] = useState([]); // A simple state to store cart items

  // Function to open the modal with a specific item
  const openModalWithItem = (item) => {
    setSelectedMenuItem(item);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMenuItem(null);
  };

  // Function to handle adding an item to the cart
  const handleAddToCart = (itemWithCustomizations) => {
    // In a real app, you would add this to a global cart state or context
    console.log("Adding to cart:", itemWithCustomizations);
    setCart(prevCart => [...prevCart, itemWithCustomizations]);
    // You might also want to show a toast notification here
    alert(`${itemWithCustomizations.name} added to cart!`);
    console.log("Current Cart:", [...cart, itemWithCustomizations]);
  };




  
  const displayedItems = menuItems;

  return (
    <div>
    <div className="menu-section-container">
      {/* The Header component with navigation tabs */}
      <Navigation />

      <MenuHeader />

      {/* The Grid of Menu Items */}
      <main className="menu-main-content">
        <div className="menu-items-grid">
          {displayedItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onAddClick={openModalWithItem} />
          ))}
        </div>
      </main>
      {isModalOpen && selectedMenuItem && (
        <MenuItemModal 
          item={selectedMenuItem} 
          onClose={closeModal} 
          onAddToCart={handleAddToCart}
        />
      )}
      </div>
      <div> 
      {/* Optional Footer Section */}
      <footer className="menu-footer">
        <div className="footer-content">
          <p className="footer-text">Scroll to explore more delicious items</p>
          <div className="footer-decorative-line"></div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default MenuSection;
