import React, { useState } from 'react';
import { Plus, Minus, Trash, Loader } from 'lucide-react';
import './Styles/CartPage.css';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";

const BASE_URL = import.meta.env.VITE_Base_url;

function CartPage() {
  const navigate = useNavigate();
  const { cart, removeItem, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate totals properly
  const calculateItemTotal = (item) => {
    const basePrice = item.price || 0;
    const taxAmount = item.taxAmount || 0;
    return (basePrice + taxAmount) * item.quantity;
  };

  const breakdown = cart.items.reduce((acc, item) => {
    const basePrice = item.price || 0;
    const taxPerUnit = item.taxAmount || 0;
    const baseTotal = basePrice * item.quantity;
    const taxTotal = taxPerUnit * item.quantity;
    
    return {
      subtotal: acc.subtotal + baseTotal,
      tax: acc.tax + taxTotal
    };
  }, { subtotal: 0, tax: 0 });

  const total = breakdown.subtotal + breakdown.tax;

  const handleQuantityUpdate = (index, newQuantity) => {
    updateQuantity(index, newQuantity);
  };
const handleProceedToPayment = async () => {
  if (cart.items.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  setLoading(true);
  setError(null);

  // Calculate totals
  const totalWithTax = breakdown.subtotal + breakdown.tax;
  const totalWithoutTax = breakdown.subtotal;

  // Prepare order payload exactly as per API spec
  const orderPayload = {
    channel: "Palas Kiosk",
    items: cart.items.map(item => ({
      item_skuid: item.skuCode || item.itemId.toString(),
      quantity: item.quantity
    })),
  total_amount_include_tax: Math.round(totalWithTax),
  total_amount_exclude_tax: Math.round(totalWithoutTax),

  };

  console.log('Creating Order:', orderPayload);

  try {
    const response = await fetch(`${BASE_URL}/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create order');
    }

    const result = await response.json();
    console.log('Order Created:', result);
    
    // API returns: { order_id, total_amount_include_tax, total_amount_exclude_tax }
    navigate('/payment', { 
      state: { 
        KDSInvoiceId: result.kds_invoice_id,
        orderId: result.order_id,
        kot_code: result.kot_code,
        totalAmount: result.total_amount_include_tax,
        orderDetails: {
          items: cart.items,
          subtotal: breakdown.subtotal,
          tax: breakdown.tax,
          total: totalWithTax
        }
      } 
    });
    
    // Clear cart after successful order creation
    clearCart();

  } catch (error) {
    console.error('Error creating order:', error);
    setError(error.message || 'Failed to process your order. Please try again.');
    setLoading(false);
    
    setTimeout(() => setError(null), 5000);
  }
};




  return (
    <div className="cart-root">
      <header className="nav-header">
  {/* <div className="cart-header-content"> */}
    <span 
      className="back-button" 
      onClick={() => navigate('/dinein')}
      style={{ cursor: "pointer" }}
    >
      <IoMdArrowRoundBack/>
      
    </span>
      <h1 className="nav-title">Your Cart</h1>
  {/* </div> */}
</header>


      <main className="cart-content">
        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            color: '#C62828',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="cart-items-container">
          {cart.items.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <button 
                onClick={() => navigate('/dinein')}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 2rem',
                  background: 'var(--secondary-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.items.map((item, idx) => {
              const itemTotal = calculateItemTotal(item);
              const pricePerUnit = (item.price || 0) + (item.taxAmount || 0);
              
              return (
               <div className="cart-item-card" key={idx}>
  <div className="cart-item-top">
    <img 
      src={item.imageURL ||  './placeholder.jpg' } 
      alt={item.itemName} 
      className="cart-item-img"
      onError={(e) => {
        e.target.src = '/images/placeholder.jpg';
      }}
    />
    <div className="cart-item-info">
      <div className="cart-item-title">{item.itemName}</div>
      {item.tags && item.tags.length > 0 && (
        <div className="cart-item-tags">
          {item.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="tag-small">{tag}</span>
          ))}
        </div>
      )}
      <div className="cart-item-price-info">
        Base: ₹{item.price.toFixed(2)} + Tax: ₹{(item.taxAmount || 0).toFixed(2)}
      </div>
    </div>
  </div>
  
  <button 
    className="delete-btn" 
    onClick={() => removeItem(idx)}
    disabled={loading}
  >
    <Trash size={16} />
  </button>
  
  <div className="cart-item-bottom">
    <div className="qty-controls">
      <button
        className="qty-btn"
        onClick={() => handleQuantityUpdate(idx, Math.max(1, item.quantity - 1))}
        disabled={item.quantity <= 1 || loading}
      >
        <Minus size={16} />
      </button>
      <span className="qty">{item.quantity}</span>
      <button
        className="qty-btn"
        onClick={() => handleQuantityUpdate(idx, item.quantity + 1)}
        disabled={loading}
      >
        <Plus size={16} />
      </button>
    </div>
    
    <div className="cart-item-price">
      <span className="item-each-price">
        ₹{pricePerUnit.toFixed(2)} each
      </span>
      <span className="item-total-price">
        ₹{itemTotal.toFixed(2)}
      </span>
    </div>
  </div>
</div>

              );
            })
          )}
        </div>
        
        {cart.items.length > 0 && (
          <div className="cart-summary-card">
            <div className="summary-row">
              <span>Base Amount:</span>
              <span>₹{breakdown.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Total Tax:</span>
              <span>₹{breakdown.tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            
            <button 
              className="payment-btn"
              onClick={handleProceedToPayment}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                opacity: loading ? 0.8 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} className="spinning" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Payment</span>
                  {/* <span style={{ fontWeight: 'bold' }}>₹{total.toFixed(2)}</span> */}
                </>
              )}
            </button>

            {loading && (
              <div style={{
                textAlign: 'center',
                marginTop: '1rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                Please wait while we process your order...
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default CartPage;
