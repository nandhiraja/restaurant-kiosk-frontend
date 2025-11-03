import React, { useState } from 'react';
import { ShoppingCart, Home, ChevronDown, ChevronUp } from 'lucide-react';
import CartPage from './CartPage'; // or import your CartPage if it is styled as a modal
import './Styles/MenuHeader.css';
import { useEffect } from 'react';
const categories = ["Indian", "Italian", "Chinese", "Desserts", "Beverages", "Indian", "Italian", "Chinese", "Desserts", "Beverages", "Indian", "Italian", "Chinese", "Desserts", "Beverages"];
const BASE_URL = import.meta.env.VITE_Base_url;

const MenuHeader = ({onSelectCategory}) => {
  const [activeCategory, setActiveCategory] = useState("Indian");
    const [category, setCategory] = useState([]);
    const [MenuData, setData] = useState([]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showCart, setShowCart] = useState(false);    // <-- Add this state

  const handleCategoryClick = (category) => {
    onSelectCategory(category.legacy_id);
    setActiveCategory(category.name);
    console.log(`Switching to category: ${category.legacy_id}`);
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

  useEffect(() => {
  console.log("Fetching category data from backend...", BASE_URL);

  fetch(`${BASE_URL}/menu/categories`)
    .then(async (response) => {
      console.log("Status:", response.status);
      console.log("Response Type:", response.headers.get("content-type"));

      const text = await response.text(); // get raw text to inspect
      console.log("Raw Response:", text);

      try {
        const data = JSON.parse(text);
        setCategory(data);
        console.log("Menu section category Data received:", data);
      } catch (err) {
        console.error("Response was not JSON:", err);
      }
    })
    .catch((err) => {
      console.error("Some error in category fetching:", err);
    });
}, []);


  // useEffect(()=>{
  //   console.log("Fetching category data from backend... "+ BASE_URL);
  //   fetch(`https://4351c8539fe4.ngrok-free.app/menu/categories`).then((response)=>response.json())
  //   .then((data)=>{setCategory(data);console.log(" menu section category Data recived..." , data)  })
  //   .catch(()=>{console.error("Some error in category fetching..")})
  // },[])

 
    console.log(("This fetch from MenuHeader :" ,category))

  return (
    <header className="menu-header">
      {/* Top Bar */}
             <Navigation />


      {/* Category Navigation */}
      <div className="category-container">
        <nav className={`category-navigation ${isExpanded ? 'expanded' : 'collapsed'}`}>
          {category.map((category, index) => (
            <button
              key={`${category.name}-${category.legacy_id}`}
              onClick={() => handleCategoryClick(category)}
              className={`category-btn ${activeCategory === category.name ? 'active' : ''}`}
            >
              {category.name}
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
