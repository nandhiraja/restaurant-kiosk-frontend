import React from 'react';
import { Plus, Minus, Trash } from 'lucide-react';
import './Styles/CartPage.css'; // Create or modify as needed
import { useCart } from './CartContext';

const TAX_RATE = 0.10; // 10% as in screenshot

function CartPage({onClose}) {
  const { cart, removeItem, updateQuantity } = useCart();

  // Cart calculations
  const subtotal = cart.items.reduce((acc, item) => acc + item.finalPrice * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="cart-root">
      <header className="cart-header">
        <span className="back-arrow" onClick={onClose} style={{cursor : "pointer"}}>{'←'}</span>
        <h1>Your Cart</h1>
      </header>
      <main className="cart-content">
        <div className="cart-items-container">
          {cart.items.map((item, idx) => (
            <div className="cart-item-card" key={idx}>
              <img src={item.imageSrc || '/placeholder.jpg'} alt={item.name} className="cart-item-img" />
              <div className="cart-item-info">
                <div className="cart-item-title">{item.name}</div>
                <div className="cart-item-category">{item.category || ''}</div>
              </div>
              <div className="cart-qty-price">
                <div className="qty-controls">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(idx, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="qty">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(idx, item.quantity + 1)}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <span className="item-each-price">
                  ${item.finalPrice.toFixed(2)} each
                </span>
                <span className="item-total-price">
                  ${ (item.finalPrice * item.quantity).toFixed(2) }
                </span>
                <button className="delete-btn" onClick={() => removeItem(idx)}>
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary-card">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (10%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="payment-btn">
            Proceed to Payment
          </button>
        </div>
      </main>
    </div>
  );
}

export default CartPage;
