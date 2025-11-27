import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, QrCode, ChevronDown, ChevronUp, Printer, Send, Check, Loader } from 'lucide-react';
import './Styles/PaymentPage.css';
import { useCart } from './CartContext';
import TokenSuccess from './TokenSuccess'
import { IoMdArrowRoundBack } from "react-icons/io";

const BASE_URL = import.meta.env.VITE_Base_url;

import {openPrintWindow, generateRestaruentBill,generateKOTBill } from './utils/printBillTemplates';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const { kot_code, orderId, totalAmount, orderDetails } = location.state || {};
  const [showTokenPage, setShowTokenPage] = useState(false);
  const [KDSInvoiceId, setKDSInvoiceId] = useState(null);

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
        // setPaymentStatus('TIMEOUT');
        // setError('Payment timeout. Please try again.');

        setPaymentStatus('FAILED');
        navigate("/");
        setError('Payment failed or cancelled. Please try again.');
        clearInterval(pollingRef.current);

        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/payments/qr/status/${orderId}`,{
          headers:{
              "ngrok-skip-browser-warning": "true"
          }
        });
        let raw_data =  await response.text()
        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const result = JSON.parse(raw_data);
        
        // const result = await response.json();
        console.log('QR Status:', result);
        
        // Result: { order_id, amount_paise, status, payment_method, transaction_id, payment_timestamp, created_at }
       // ✅ CORRECTED: Check payment_status instead of status

      if (result.payment_status === 'COMPLETED') {
          
          setPaymentStatus('SUCCESS');
          setTransactionDetails(result);
          setKDSInvoiceId(result.kds_invoice_id)
          clearCart();
          localStorage.removeItem('restaurantCart');
          // Redirect to Token Page instead of rendering old UI
          setShowTokenPage(true);
          clearInterval(pollingRef.current);
        }
        else if (result.payment_status === 'FAILED') {
        setPaymentStatus('FAILED');
        navigate("/");
        setError('Payment failed. Please try again.');
        clearInterval(pollingRef.current);
      }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentStatus('FAILED');
        navigate("/");
        setError('Payment failed or cancelled. Please try again.');
        clearInterval(pollingRef.current);
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
        "ngrok-skip-browser-warning": "true"
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
    
    setEdcData(result);
    setPaymentStatus('PROCESSING');
    
    // Trigger mock payment FIRST, then start polling
    await triggerMockPayment();
    
    // Start polling AFTER mock payment is triggered
    startEDCStatusPolling();

  } catch (error) {
    console.error('Error initializing EDC:', error);
    setError('Failed to initialize card payment. Please try again.');
  } finally {
    setLoadingEDC(false);
  }
};

// Trigger mock payment via backend
const triggerMockPayment = async () => {
  try {
    console.log('Triggering mock payment for order:', orderId);
    
    const response = await fetch(`${BASE_URL}/payments/edc/mock-trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({ order_id: orderId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to trigger mock payment');
    }
    
    const data = await response.json();
    console.log("Mock payment triggered successfully:", data);
    
    // Wait 2 seconds for PhonePe to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (err) {
    console.error("Payment API error:", err);
    setError('Failed to trigger mock payment. Please try again.');
    throw err;
  }
};





// Poll EDC Payment Status
const startEDCStatusPolling = () => {
  let pollCount = 0;
  const maxPolls = 120; // 6 minutes timeout
  
  pollingRef.current = setInterval(async () => {
    pollCount++;
    
    if (pollCount > maxPolls) {
      clearInterval(pollingRef.current);
      setPaymentStatus('TIMEOUT');
      setError('Payment timeout. Please try again.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/payments/edc/status/${orderId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check status');
      }

      const result = await response.json();
      console.log('EDC Status:', result);
      
      // Use consistent field name - confirm with your backend
      if (result.payment_status === 'COMPLETED') {
        setPaymentStatus('SUCCESS');
        setTransactionDetails(result);
        setKDSInvoiceId(result.kds_invoice_id);
        clearCart();
        localStorage.removeItem('restaurantCart');
        setShowTokenPage(true);
        clearInterval(pollingRef.current);
        
      } else if (result.payment_status === 'FAILED' || result.payment_status === 'CANCELLED') {
        setPaymentStatus('FAILED');
        navigate("/");
        setError('Payment failed or cancelled. Please try again.');
        clearInterval(pollingRef.current);
      }
      
    } catch (error) {
      console.error('Error checking EDC status:', error);
        setPaymentStatus('FAILED');
        navigate("/");
        setError('Payment failed or cancelled. Please try again.');
        clearInterval(pollingRef.current);
      // Don't stop polling on network errors, continue trying
    }
  }, 3000);
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  };
}, []);

 // Replace handlePrintKOT with:
const handlePrintKOT = () => {
  const kotHTML = generateKOTBill(orderId, kot_code, KDSInvoiceId, orderDetails);
  openPrintWindow(kotHTML, `KOT - ${orderId}`, 1000, 1250);
};

// Replace handlePrintBill with:
const handlePrintBill = () => {
  const billHTML = generateRestaruentBill(
    orderId, 
    kot_code, 
    KDSInvoiceId, 
    orderDetails, 
    transactionDetails, 
    whatsappNumber
  );
  openPrintWindow(billHTML, `Bill - ${orderId}`, 1000, 1200);
};

  // Send via WhatsApp
  const handleWhatsAppKOT = () => {
    if (!whatsappNumber || whatsappNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    
    const message = `*KITCHEN ORDER TICKET*\n\nOrder ID: ${kot_code}\nTransaction ID: ${transactionDetails?.transaction_id || 'N/A'}\nDate: ${new Date().toLocaleString()}\n\n*Items:*\n${orderDetails.items.map(item => `${item.itemName} x${item.quantity}`).join('\n')}\n\nSubtotal: ₹${orderDetails.subtotal.toFixed(2)}\nTax: ₹${orderDetails.tax.toFixed(2)}\nTotal: ₹${orderDetails.total.toFixed(2)}\n\nThank you for your order!`;
    
    const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsappInput(false);
    setWhatsappNumber('');
  };
 const handleBackCartClick = () => {
    navigate('/cart');
  };


  if (showTokenPage) {
  return (
    <TokenSuccess
      token={kot_code} // Use the orderId, or actual token value if different
      KDSInvoiceId={KDSInvoiceId}
      orderId={orderId}
      orderDetails={orderDetails}
      transactionDetails={transactionDetails}
      onPrintBill={handlePrintBill}
      onPrintKOT={handlePrintKOT}
      onSendWhatsapp={(whatsappNumber) => handleWhatsAppKOT(whatsappNumber)}
    />
  );
}


  return (

    
    <div className="payment-root">
      <div className="nav-header">
              <button className="back-button" onClick={handleBackCartClick}>
                <IoMdArrowRoundBack size={30}/>
              </button>
              <h1 className="nav-title">payment</h1>
      </div>
      
      <div className="payment-container">
        {/* Order Summary */}
        <div className="order-summary-compact">
          <h3 className="summary-heading">Order Summary</h3>
          {/* <p className="order-id-display">Order ID: <strong>{orderId}</strong></p> */}
          
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
  <div className="method-header">
    <div className="method-info">
      <QrCode size={24} />
      <span className="method-name">UPI / QR Code</span>
    </div>
    
    {/* Direct Pay Button */}
    <button 
      className="direct-pay-btn"
      onClick={(e) => {
        e.stopPropagation();
        if (!qrData && !loadingQR) {
          setSelectedMethod('qr');
          setExpandedMethod('qr');
          handleGenerateQR();
        }
      }}
      disabled={loadingQR || qrData}
    >
      {loadingQR ? (
        <>
          <Loader size={18} className="spinning" />
          Generating...
        </>
      ) : qrData ? (
        <>
          <Check size={18} />
          QR Ready
        </>
      ) : (
        'Pay UPI'
      )}
    </button>
  </div>
  
  {expandedMethod === 'qr' && qrData && (
    <div className="method-content">
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
        <p><strong>Amount:</strong> ₹{(parseInt(amountInPaise) / 100).toFixed(2)}</p>
        <p><strong>Expires At:</strong> {new Date(qrData.expires_at).toLocaleString()}</p>
      </div>
      
      {paymentStatus === 'PROCESSING' && (
        <div className="waiting-indicator">
          <div className="spinner"></div>
          <p>Waiting for payment confirmation...</p>
        </div>
      )}
    </div>
  )}
</div>

{/* EDC Card Payment */}
<div className={`payment-method-card ${selectedMethod === 'edc' ? 'selected' : ''}`}>
  <div className="method-header">
    <div className="method-info">
      <CreditCard size={24} />
      <span className="method-name">Card</span>
    </div>
    
    {/* Direct Pay Button */}
    <button 
      className="direct-pay-btn card-pay"
      onClick={(e) => {
        e.stopPropagation();
        if (!edcData && !loadingEDC) {
          setSelectedMethod('edc');
          setExpandedMethod('edc');
          handleEDCPayment();
        }
      }}
      disabled={loadingEDC || edcData}
    >
      {loadingEDC ? (
        <>
          <Loader size={18} className="spinning" />
          Initializing...
        </>
      ) : edcData ? (
        <>
          <Check size={18} />
          Processing
        </>
      ) : (
        `Pay card`
      )}
    </button>
  </div>
  
  {expandedMethod === 'edc' && edcData && (
    <div className="method-content">
      <div className="edc-info">
        <p className="edc-instruction">Please insert or tap your card on the EDC device</p>
        <div className="transaction-details">
          <p> ₹{(parseInt(amountInPaise) / 100).toFixed(2)}</p>
          {/* <strong>Amount:</strong> */}
        </div>
      </div>
      
      {paymentStatus === 'PROCESSING' && (
        <div className="waiting-indicator">
          <div className="spinner"></div>
          <p>Processing card payment...</p>
        </div>
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
