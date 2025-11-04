import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, QrCode, ChevronDown, ChevronUp, Printer, Send, Check } from 'lucide-react';
import './Styles/PaymentPage.css';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData, cartTotal, paymentResponse } = location.state || {};
  
  const [selectedMethod, setSelectedMethod] = useState(null); // null initially
  const [expandedMethod, setExpandedMethod] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [showWhatsappInput, setShowWhatsappInput] = useState(false);

  if (!orderData) {
    return (
      <div className="payment-root">
        <div className="payment-error">
          <h2>No order data found</h2>
          <button onClick={() => navigate('/cart')} className="back-to-cart-btn">
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  const handleMethodToggle = (method) => {
    setSelectedMethod(method);
    setExpandedMethod(expandedMethod === method ? null : method);
  };

  // Simulate QR Payment - only when user clicks "Pay with QR"
  const handleQRPayment = () => {
    setPaymentProcessing(true);
    
    // Simulate payment verification after 5 seconds
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      setOrderId(`ORD${Date.now()}`);
    }, 5000); // 5 seconds to simulate payment
  };

  // Simulate Card Payment - only when user clicks "Pay Now"
  const handleCardPayment = () => {
    setPaymentProcessing(true);
    
    // Simulate card processing after 3 seconds
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      setOrderId(`ORD${Date.now()}`);
    }, 3000); // 3 seconds for card payment
  };

  const handlePrintKOT = () => {
    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>KOT - ${orderId}</title>
          <style>
            body { font-family: monospace; padding: 10px; font-size: 12px; }
            h2 { text-align: center; margin: 10px 0; }
            .item { margin: 5px 0; display: flex; justify-content: space-between; }
            hr { border: 1px dashed #333; }
          </style>
        </head>
        <body>
          <h2>KITCHEN ORDER TICKET</h2>
          <hr>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          ${orderData.items.map(item => `
            <div class="item">
              <span>${item.itemName} x${item.quantity}</span>
            </div>
          `).join('')}
          <hr>
          <p style="text-align: center; margin-top: 20px;">** END OF KOT **</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintBill = () => {
    const printWindow = window.open('', '', 'width=400,height=700');
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill - ${orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; }
            h2 { text-align: center; margin: 10px 0; }
            .header { text-align: center; margin-bottom: 20px; }
            .item-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .totals { margin-top: 20px; border-top: 2px solid #333; padding-top: 10px; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; font-weight: bold; }
            hr { border: 1px solid #333; }
            .footer { text-align: center; margin-top: 30px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RESTAURANT BILL</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p>${new Date().toLocaleString()}</p>
          </div>
          <hr>
          <h3>Items:</h3>
          ${orderData.items.map(item => `
            <div class="item-row">
              <span>${item.itemName} x${item.quantity}</span>
              <span>₹${item.total.toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="totals">
            <div class="item-row">
              <span>Subtotal:</span>
              <span>₹${orderData.subtotal.toFixed(2)}</span>
            </div>
            <div class="item-row">
              <span>Tax:</span>
              <span>₹${orderData.tax.toFixed(2)}</span>
            </div>
            <hr>
            <div class="total-row">
              <span>TOTAL:</span>
              <span>₹${orderData.total.toFixed(2)}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>Visit again soon</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleWhatsAppKOT = () => {
    if (!whatsappNumber || whatsappNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    
    const message = `*KITCHEN ORDER TICKET*\n\nOrder ID: ${orderId}\nDate: ${new Date().toLocaleString()}\n\n*Items:*\n${orderData.items.map(item => `${item.itemName} x${item.quantity}`).join('\n')}\n\nTotal: ₹${orderData.total.toFixed(2)}`;
    
    const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsappInput(false);
    setWhatsappNumber('');
  };

  return (
    <div className="payment-root">
      <div className="payment-container">
        {/* Order Summary - Left Side */}
        <div className="order-summary-compact">
          <h3 className="summary-heading">Order Summary</h3>
          <div className="summary-items">
            {orderData.items.map((item, idx) => (
              <div key={idx} className="summary-item-row">
                <span className="item-name-qty">
                  {item.itemName} <span className="qty-badge">x{item.quantity}</span>
                </span>
                <span className="item-amount">₹{item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="summary-total-row">
              <span>Subtotal:</span>
              <span>₹{orderData.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-total-row">
              <span>Tax:</span>
              <span>₹{orderData.tax.toFixed(2)}</span>
            </div>
            <div className="summary-total-row grand-total">
              <span>Total:</span>
              <span>₹{orderData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods - Right Side */}
        <div className="payment-methods-section">
          {!paymentSuccess ? (
            <>
              <h2 className="payment-heading">Select Payment Method</h2>
              
              {/* QR Code Payment */}
              <div className={`payment-method-card ${selectedMethod === 'qr' ? 'selected' : ''}`}>
                <div 
                  className="method-header"
                  onClick={() => handleMethodToggle('qr')}
                >
                  <div className="method-info">
                    <QrCode size={24} />
                    <span className="method-name">UPI / QR Code</span>
                  </div>
                  {expandedMethod === 'qr' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedMethod === 'qr' && paymentResponse?.data?.qrString && (
                  <div className="method-content">
                    <div className="qr-container">
                      <QRCodeSVG 
                        value={paymentResponse.data.qrString}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="qr-instruction">Scan this QR code with any UPI app</p>
                    <div className="transaction-details">
                      <p><strong>Transaction ID:</strong> {paymentResponse.data.transactionId}</p>
                      <p><strong>Amount:</strong> ₹{paymentResponse.data.amount}</p>
                    </div>
                    
                    {!paymentProcessing ? (
                      <button 
                        className="confirm-payment-btn"
                        onClick={handleQRPayment}
                      >
                        I Have Paid - Verify Payment
                      </button>
                    ) : (
                      <div className="waiting-indicator">
                        <div className="spinner"></div>
                        <p>Verifying payment...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Payment */}
              <div className={`payment-method-card ${selectedMethod === 'card' ? 'selected' : ''}`}>
                <div 
                  className="method-header"
                  onClick={() => handleMethodToggle('card')}
                >
                  <div className="method-info">
                    <CreditCard size={24} />
                    <span className="method-name">Card Payment</span>
                  </div>
                  {expandedMethod === 'card' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedMethod === 'card' && (
                  <div className="method-content">
                    <div className="card-form">
                      <input type="text" placeholder="Card Number" className="card-input" maxLength="16" />
                      <div className="card-row">
                        <input type="text" placeholder="MM/YY" className="card-input-half" maxLength="5" />
                        <input type="text" placeholder="CVV" className="card-input-half" maxLength="3" />
                      </div>
                      <input type="text" placeholder="Cardholder Name" className="card-input" />
                      
                      {!paymentProcessing ? (
                        <button 
                          className="pay-now-btn"
                          onClick={handleCardPayment}
                        >
                          Pay ₹{orderData.total.toFixed(2)}
                        </button>
                      ) : (
                        <div className="waiting-indicator">
                          <div className="spinner"></div>
                          <p>Processing payment...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Payment Success Screen
            <div className="payment-success">
              <div className="success-icon">
                <Check size={60} />
              </div>
              <h2>Payment Successful!</h2>
              <p className="order-id">Order ID: <strong>{orderId}</strong></p>
              
              <div className="action-buttons">
                <button className="action-btn print-kot" onClick={handlePrintKOT}>
                  <Printer size={20} />
                  Print KOT
                </button>
                
                <button className="action-btn print-bill" onClick={handlePrintBill}>
                  <Printer size={20} />
                  Print Bill
                </button>
                
                <button 
                  className="action-btn whatsapp-kot" 
                  onClick={() => setShowWhatsappInput(!showWhatsappInput)}
                >
                  <Send size={20} />
                  Send KOT via WhatsApp
                </button>
              </div>

              {showWhatsappInput && (
                <div className="whatsapp-input-section">
                  <input
                    type="tel"
                    placeholder="Enter WhatsApp Number (10 digits)"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="whatsapp-input"
                  />
                  <button className="send-whatsapp-btn" onClick={handleWhatsAppKOT}>
                    Send
                  </button>
                </div>
              )}

              <button 
                className="new-order-btn"
                onClick={() => navigate('/')}
              >
                Start New Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
