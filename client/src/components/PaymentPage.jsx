import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, QrCode, ChevronDown, ChevronUp, Printer, Send, Check, Loader } from 'lucide-react';
import './Styles/PaymentPage.css';
import { useCart } from './CartContext';

const BASE_URL = import.meta.env.VITE_Base_url;

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const { orderId, totalAmount, orderDetails } = location.state || {};
  
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [expandedMethod, setExpandedMethod] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [edcData, setEdcData] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [loadingEDC, setLoadingEDC] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [showWhatsappInput, setShowWhatsappInput] = useState(false);
  const [error, setError] = useState(null);
  
  const pollingRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  if (!orderId || !orderDetails) {
    return (
      <div className="payment-root">
        <div className="payment-error">
          <h2>No order found</h2>
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

  // Convert INR to Paise (multiply by 100)
  const amountInPaise = Math.round(totalAmount * 100).toString();

  // Generate QR Code
  const handleGenerateQR = async () => {
    setLoadingQR(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/payments/qr/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          amount_paise: amountInPaise
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const result = await response.json();
      console.log('QR Initialized:', result);
      
      // Result: { order_id, amount_paise, qr_code, status, timestamp }
      setQrData(result);
      setPaymentStatus('PROCESSING');
      
      // Start polling for payment status
      startQRStatusPolling();

    } catch (error) {
      console.error('Error generating QR:', error);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setLoadingQR(false);
    }
  };

  // Poll QR Payment Status
  const startQRStatusPolling = () => {
    let pollCount = 0;
    const maxPolls = 120; // 6 minutes (120 * 3 seconds)
    
    pollingRef.current = setInterval(async () => {
      pollCount++;
      
      if (pollCount > maxPolls) {
        clearInterval(pollingRef.current);
        setPaymentStatus('TIMEOUT');
        setError('Payment timeout. Please try again.');
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/payments/qr/status/${orderId}`);
        
        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const result = await response.json();
        console.log('QR Status:', result);
        
        // Result: { order_id, amount_paise, status, payment_method, transaction_id, payment_timestamp, created_at }
       // ✅ CORRECTED: Check payment_status instead of status
      if (result.payment_status === 'COMPLETED') {
        setPaymentStatus('SUCCESS');
        setTransactionDetails(result);
        clearCart();
        localStorage.removeItem('restaurantCart');

        clearInterval(pollingRef.current);
      } else if (result.payment_status === 'FAILED') {
        setPaymentStatus('FAILED');
        setError('Payment failed. Please try again.');
        clearInterval(pollingRef.current);
      }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000); // Poll every 3 seconds
  };

  // Initialize EDC Payment
  const handleEDCPayment = async () => {
    setLoadingEDC(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/payments/edc/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          amount_paise: amountInPaise
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize EDC payment');
      }

      const result = await response.json();
      console.log('EDC Initialized:', result);
      
      // Result: { order_id, amount_paise, edc_reference, status, timestamp, device_id }
      setEdcData(result);
      setPaymentStatus('PROCESSING');
      
      // Start polling for EDC payment status
      startEDCStatusPolling();

    } catch (error) {
      console.error('Error initializing EDC:', error);
      setError('Failed to initialize card payment. Please try again.');
    } finally {
      setLoadingEDC(false);
    }
  };

  // Poll EDC Payment Status
  const startEDCStatusPolling = () => {
    let pollCount = 0;
    const maxPolls = 120;
    
    pollingRef.current = setInterval(async () => {
      pollCount++;
      
      if (pollCount > maxPolls) {
        clearInterval(pollingRef.current);
        setPaymentStatus('TIMEOUT');
        setError('Payment timeout. Please try again.');
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/payments/edc/status/${orderId}`);
        
        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const result = await response.json();
        console.log('EDC Status:', result);
        
        // Result: { order_id, amount_paise, status, payment_method, transaction_id, edc_reference, card_last_four, payment_timestamp, created_at }
        if (result.status === 'COMPLETED') {
          setPaymentStatus('SUCCESS');
          setTransactionDetails(result);
          clearInterval(pollingRef.current);
        } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
          setPaymentStatus('FAILED');
          setError('Payment failed or cancelled. Please try again.');
          clearInterval(pollingRef.current);
        }
      } catch (error) {
        console.error('Error checking EDC status:', error);
      }
    }, 3000);
  };

  // Print KOT
  const handlePrintKOT = () => {
    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>KOT - ${orderId}</title>
          <style>
            body { font-family: monospace; padding: 10px; font-size: 12px; }
            h2 { text-align: center; margin: 10px 0; }
            .item { margin: 5px 0; }
            hr { border: 1px dashed #333; }
          </style>
        </head>
        <body>
          <h2>KITCHEN ORDER TICKET</h2>
          <hr>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          ${orderDetails.items.map(item => `
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

  // Print Bill
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
            <p><strong>Transaction ID:</strong> ${transactionDetails?.transaction_id || 'N/A'}</p>
            <p>${new Date().toLocaleString()}</p>
          </div>
          <hr>
          <h3>Items:</h3>
          ${orderDetails.items.map(item => {
            const itemTotal = (item.price + (item.taxAmount || 0)) * item.quantity;
            return `
              <div class="item-row">
                <span>${item.itemName} x${item.quantity}</span>
                <span>₹${itemTotal.toFixed(2)}</span>
              </div>
            `;
          }).join('')}
          <div class="totals">
            <div class="item-row">
              <span>Subtotal:</span>
              <span>₹${orderDetails.subtotal.toFixed(2)}</span>
            </div>
            <div class="item-row">
              <span>Tax:</span>
              <span>₹${orderDetails.tax.toFixed(2)}</span>
            </div>
            <hr>
            <div class="total-row">
              <span>TOTAL:</span>
              <span>₹${orderDetails.total.toFixed(2)}</span>
            </div>
          </div>
          <div class="footer">
            <p>Payment Method: ${transactionDetails?.payment_method || 'N/A'}</p>
            <p>Thank you for dining with us!</p>
            <p>Visit again soon</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Send via WhatsApp
  const handleWhatsAppKOT = () => {
    if (!whatsappNumber || whatsappNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    
    const message = `*KITCHEN ORDER TICKET*\n\nOrder ID: ${orderId}\nTransaction ID: ${transactionDetails?.transaction_id || 'N/A'}\nDate: ${new Date().toLocaleString()}\n\n*Items:*\n${orderDetails.items.map(item => `${item.itemName} x${item.quantity}`).join('\n')}\n\nSubtotal: ₹${orderDetails.subtotal.toFixed(2)}\nTax: ₹${orderDetails.tax.toFixed(2)}\nTotal: ₹${orderDetails.total.toFixed(2)}\n\nThank you for your order!`;
    
    const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsappInput(false);
    setWhatsappNumber('');
  };

  return (
    <div className="payment-root">
      <div className="payment-container">
        {/* Order Summary */}
        <div className="order-summary-compact">
          <h3 className="summary-heading">Order Summary</h3>
          <p className="order-id-display">Order ID: <strong>{orderId}</strong></p>
          
          <div className="summary-items">
            {orderDetails.items.map((item, idx) => {
              const itemTotal = (item.price + (item.taxAmount || 0)) * item.quantity;
              return (
                <div key={idx} className="summary-item-row">
                  <span className="item-name-qty">
                    {item.itemName} <span className="qty-badge">x{item.quantity}</span>
                  </span>
                  <span className="item-amount">₹{itemTotal.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          
          <div className="summary-totals">
            <div className="summary-total-row">
              <span>Subtotal:</span>
              <span>₹{orderDetails.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-total-row">
              <span>Tax:</span>
              <span>₹{orderDetails.tax.toFixed(2)}</span>
            </div>
            <div className="summary-total-row grand-total">
              <span>Total:</span>
              <span>₹{orderDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods-section">
          {error && (
            <div className="error-message" style={{
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: '#C62828',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {paymentStatus === 'SUCCESS' ? (
            // Payment Success Screen
            <div className="payment-success">
              <div className="success-icon">
                <Check size={60} />
              </div>
              <h2>Payment Successful!</h2>
              <p className="order-id">Order ID: <strong>{orderId}</strong></p>
              {transactionDetails?.transaction_id && (
                <p className="transaction-id">Transaction ID: <strong>{transactionDetails.transaction_id}</strong></p>
              )}
              
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
                  Send via WhatsApp
                </button>
              </div>

              {showWhatsappInput && (
                <div className="whatsapp-input-section">
                  <input
                    type="tel"
                    placeholder="Enter WhatsApp Number"
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
          ) : (
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
                
                {expandedMethod === 'qr' && (
                  <div className="method-content">
                    {!qrData ? (
                      <button 
                        className="generate-qr-btn"
                        onClick={handleGenerateQR}
                        disabled={loadingQR}
                      >
                        {loadingQR ? (
                          <>
                            <Loader size={20} className="spinning" />
                            Generating QR...
                          </>
                        ) : (
                          'Generate QR Code'
                        )}
                      </button>
                    ) : (
                      <>
                        <div className="qr-container">
                          <QRCodeSVG 
                            value={qrData.qr_string}
                            size={200}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <p className="qr-instruction">Scan this QR code with any UPI app</p>
                        <div className="transaction-details">
                            <p><strong>Order ID:</strong> {qrData.order_id}</p>
                            <p><strong>Transaction ID:</strong> {qrData.transaction_id}</p>
                            <p><strong>Amount:</strong> ₹{(parseInt(amountInPaise) / 100).toFixed(2)}</p>
                            <p><strong>Expires At:</strong> {new Date(qrData.expires_at).toLocaleString()}</p>
                            <p><strong>Provider:</strong> {qrData.provider}</p>
                          </div>

                        
                        {paymentStatus === 'PROCESSING' && (
                          <div className="waiting-indicator">
                            <div className="spinner"></div>
                            <p>Waiting for payment confirmation...</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* EDC Card Payment */}
              <div className={`payment-method-card ${selectedMethod === 'edc' ? 'selected' : ''}`}>
                <div 
                  className="method-header"
                  onClick={() => handleMethodToggle('edc')}
                >
                  <div className="method-info">
                    <CreditCard size={24} />
                    <span className="method-name">Card Payment (EDC)</span>
                  </div>
                  {expandedMethod === 'edc' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedMethod === 'edc' && (
                  <div className="method-content">
                    {!edcData ? (
                      <button 
                        className="pay-now-btn"
                        onClick={handleEDCPayment}
                        disabled={loadingEDC}
                      >
                        {loadingEDC ? (
                          <>
                            <Loader size={20} className="spinning" />
                            Initializing...
                          </>
                        ) : (
                          `Pay ₹${orderDetails.total.toFixed(2)} with Card`
                        )}
                      </button>
                    ) : (
                      <>
                        <div className="edc-info">
                          <p className="edc-instruction">Please insert or tap your card on the EDC device</p>
                          <div className="transaction-details">
                            <p><strong>EDC Reference:</strong> {edcData.edc_reference}</p>
                            <p><strong>Device ID:</strong> {edcData.device_id}</p>
                            <p><strong>Amount:</strong> ₹{(parseInt(edcData.amount_paise) / 100).toFixed(2)}</p>
                            <p><strong>Status:</strong> {edcData.status}</p>
                          </div>
                        </div>
                        
                        {paymentStatus === 'PROCESSING' && (
                          <div className="waiting-indicator">
                            <div className="spinner"></div>
                            <p>Processing card payment...</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
