import React, { useState } from 'react';
import { Plus, Minus, Trash, Loader } from 'lucide-react';
import './Styles/CartPage.css';
import { useCart } from './CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";

const BASE_URL = import.meta.env.VITE_Base_url;
// just for verification
const others = [   
  "1302832751",
  "1302832750",
  "1302832749",
  "1302832748",
  "1302832747",
  "1302832746",
  "1302832198",
]
const EXCLUDED_TAKEAWAY_ITEM_IDS = [
  "1302832751",
  "1302832750",
  "1302832749",
  "1302832748",
  "1302832747",
  "1302832746",
  "1302832198",
  "1303112180",
  "1303001035"
] // Add item IDs here to exclude from takeaway charge

function CartPage() {
  const navigate = useNavigate();
  const { cart, removeItem, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { state } = useLocation();
    

  console.log("state in cartpage : ",state)

 const {  
    orderType = 'Dine In'
  } = state || {};






  // Calculate totals properly
  const calculateItemTotal = (item) => {
    return item.pricePerUnit ? (item.pricePerUnit * item.quantity) : ((item.price || 0) + (item.taxAmount || 0)) * item.quantity;
  };

  const breakdown = cart.items.reduce((acc, item) => {
    // If it has variations/addons, calculate its base and tax.
    let basePrice = item.price || 0;
    let taxPerUnit = item.taxAmount || 0;
    
    if (item.selectedCustomizations) {
        let addonsTotal = 0;
        if (item.selectedCustomizations.addons) {
             item.selectedCustomizations.addons.forEach(a => addonsTotal += parseFloat(a.price || 0));
        }
        basePrice = (item.selectedCustomizations.variation ? parseFloat(item.selectedCustomizations.variation.price || 0) : (item.price || 0)) + addonsTotal;
        
        // recalculate tax per unit based on the new basePrice
        if (item.taxes && item.taxes.length > 0) {
            taxPerUnit = item.taxes.reduce((sum, tax) => sum + (basePrice * tax.percentage / 100), 0);
        } else {
            taxPerUnit = 0;
        }
    }

    const baseTotal = basePrice * item.quantity;
    const taxTotal = taxPerUnit * item.quantity;
    
    return {
      subtotal: acc.subtotal + baseTotal,
      tax: acc.tax + taxTotal
    };
  }, { subtotal: 0, tax: 0 });

  const orderTypePayload = orderType === 'Dine In' ? 'DINEIN' : 'TAKEAWAY';

  // Calculate Takeaway Charges
  let takeawayChargesWithoutTax = 0;
  let takeawayChargesWithTax = 0;
  let takeawayTax = 0;

  if (orderTypePayload === 'TAKEAWAY') {
    let applicableQuantity = 0;
    cart.items.forEach(item => {
      const itemId = item.skuCode || item.itemId?.toString() || '';
      if (!EXCLUDED_TAKEAWAY_ITEM_IDS.includes(itemId)) {
        applicableQuantity += item.quantity;
      }
    });

    takeawayChargesWithoutTax = applicableQuantity * 10;
    if (takeawayChargesWithoutTax > 100) {
      takeawayChargesWithoutTax = 100;
    }
    
    // 5% GST on takeaway charge
    takeawayTax = takeawayChargesWithoutTax * 0.05;
    takeawayChargesWithTax = takeawayChargesWithoutTax + takeawayTax;
  }

  const total = breakdown.subtotal + breakdown.tax + takeawayChargesWithTax;

  const handleQuantityUpdate = (index, newQuantity) => {
    updateQuantity(index, newQuantity);
  };
const handleProceedToPayment = async () => {
  if (cart.items.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  console.log("ordertype : ",orderTypePayload )
  setLoading(true);
  setError(null);

  // Calculate totals
  const totalWithTax = breakdown.subtotal + breakdown.tax + takeawayChargesWithTax;
  const totalWithoutTax = breakdown.subtotal + takeawayChargesWithoutTax;

  // Prepare order payload exactly as per API spec
  const orderPayload = {
    channel: "Palas Kiosk",
    order_type : orderTypePayload,
    items: cart.items.map(item => {
      const payloadItem = {
        item_skuid: item.skuCode || item.itemId.toString(),
        quantity: item.quantity
      };
      
      if (item.selectedCustomizations) {
        if (item.selectedCustomizations.variation) {
          payloadItem.variation_id = item.selectedCustomizations.variation.variation_id;
        }
        if (item.selectedCustomizations.addons && item.selectedCustomizations.addons.length > 0) {
          payloadItem.addon_items = item.selectedCustomizations.addons.map(addon => ({
            addon_item_id: addon.addon_item_id,
            quantity: addon.quantity || 1
          }));
        }
      }
      return payloadItem;
    }),
  total_amount_include_tax: Math.round(totalWithTax),
  total_amount_exclude_tax: Math.round(totalWithoutTax),
  takeaway_charges_without_tax: takeawayChargesWithoutTax,
  takeaway_charges_with_tax: takeawayChargesWithTax,
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
          takeawayChargeWithoutTax: takeawayChargesWithoutTax,
          takeawayTax: takeawayTax,
          takeawayChargeWithTax: takeawayChargesWithTax,
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
      onClick={() => navigate('/category')}
      style={{ cursor: "pointer" }}
    >
      <IoMdArrowRoundBack size={25}/>
      
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
                onClick={() => navigate('/category')}
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
              const pricePerUnit = item.pricePerUnit || ((item.price || 0) + (item.taxAmount || 0));
              
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
      {item.selectedCustomizations?.variation && (
         <div className="cart-item-variation" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
           Variation: {item.selectedCustomizations.variation.name}
         </div>
      )}
      {item.selectedCustomizations?.addons?.length > 0 && (
         <div className="cart-item-addons" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
           Add-ons: {item.selectedCustomizations.addons.map(a => a.name).join(', ')}
         </div>
      )}
      <div className="cart-item-price-info">
        {/* Customized base prices handled dynamically now */}
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
            {orderTypePayload === 'TAKEAWAY' && takeawayChargesWithoutTax > 0 && (
              <div className="summary-row">
                <span>Takeaway Charge:</span>
                <span>₹{takeawayChargesWithoutTax.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Total Tax:</span>
              <span>₹{(breakdown.tax + takeawayTax).toFixed(2)}</span>
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