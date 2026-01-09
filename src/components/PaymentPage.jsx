import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, QrCode, Loader, Check, Wallet } from 'lucide-react';
import './Styles/PaymentPage.css';
import { useCart } from './CartContext';
import TokenSuccess from './TokenSuccess';
import { IoMdArrowRoundBack } from "react-icons/io";
import { openPrintWindow, generateRestaruentBill, generateKOTBill, printAllBills, downloadAllBills } from './utils/printBillTemplates';

const BASE_URL = import.meta.env.VITE_Base_url;

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  // Extract order data from location state
  const { kot_code, orderId, totalAmount, orderDetails } = location.state || {};

  // State management
  const [showTokenPage, setShowTokenPage] = useState(false);
  const [KDSInvoiceId, setKDSInvoiceId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [expandedMethod, setExpandedMethod] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [edcData, setEdcData] = useState(null);
  const [cashData, setCashData] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [loadingEDC, setLoadingEDC] = useState(false);
  const [loadingCash, setLoadingCash] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [error, setError] = useState(null);
  const [cashPin, setCashPin] = useState('');
  const [showCashPinInput, setShowCashPinInput] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(100); // 100 seconds timer
  const [timerActive, setTimerActive] = useState(false);

  const pollingRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Timer countdown effect
  useEffect(() => {
    let timerInterval;
    if (timerActive && timeRemaining > 0) {
      timerInterval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setPaymentStatus('TIMEOUT');
            setError('Payment timeout. Redirecting...');
            setTimeout(() => navigate('/cart'), 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerActive, timeRemaining, navigate]);

  // Redirect if no order data
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

  // Convert amount to paise (INR * 100)
  const amountInPaise = Math.round(totalAmount * 100).toString();

  // ============================================
  // QR CODE PAYMENT HANDLERS
  // ============================================

  const handleGenerateQR = async () => {
    setLoadingQR(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/payments/qr/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          amount_paise: amountInPaise
        })
      });

      if (!response.ok) throw new Error('Failed to generate QR code');

      const result = await response.json();
      setQrData(result);
      setPaymentStatus('PROCESSING');
      setTimeRemaining(100);
      setTimerActive(true);
      startQRStatusPolling();

    } catch (error) {
      console.error('QR Generation Error:', error);
      setError('Failed to generate QR code. Please try again.');
      setLoadingQR(false);
    } finally {
      setLoadingQR(false);
    }
  };

  const startQRStatusPolling = () => {
    let pollCount = 0;
    const maxPolls = 120; // 6 minutes timeout

    pollingRef.current = setInterval(async () => {
      pollCount++;

      if (pollCount > maxPolls) {
        clearInterval(pollingRef.current);
        setPaymentStatus('FAILED');
        setError('Payment timeout. Redirecting...');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/payments/qr/status/${orderId}`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });

        if (!response.ok) throw new Error('Failed to check status');

        const result = await response.json();

        if (result.payment_status === 'COMPLETED') {
          setPaymentStatus('SUCCESS');
          setTransactionDetails(result);
          setKDSInvoiceId(result.kds_invoice_id);
          clearCart();
          localStorage.removeItem('restaurantCart');
          setShowTokenPage(true);
          clearInterval(pollingRef.current);
        } else if (result.payment_status === 'FAILED') {
          setPaymentStatus('FAILED');
          setError('Payment failed. Redirecting...');
          clearInterval(pollingRef.current);
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error('QR Status Check Error:', error);
        // Continue polling on network errors
      }
    }, 3000);
  };

  // ============================================
  // EDC CARD PAYMENT HANDLERS
  // ============================================

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

      if (!response.ok) throw new Error('Failed to initialize EDC payment');

      const result = await response.json();
      setEdcData(result);
      setPaymentStatus('PROCESSING');
      setTimeRemaining(100);
      setTimerActive(true);

      // Trigger mock payment then start polling
      // await triggerMockPayment();                   // mock pay trigger shutdown
      startEDCStatusPolling();

    } catch (error) {
      console.error('EDC Initialization Error:', error);
      setError('Failed to initialize card payment. Please try again.');
      setLoadingEDC(false);
    } finally {
      setLoadingEDC(false);
    }
  };

  const triggerMockPayment = async () => {
    try {
      const response = await fetch(`${BASE_URL}/payments/edc/mock-trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ order_id: orderId })
      });

      if (!response.ok) throw new Error('Failed to trigger mock payment');

      // Wait for PhonePe processing
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error("Mock Payment Error:", error);
      setError('Failed to process payment. Please try again.');
      throw error;
    }
  };

  const startEDCStatusPolling = () => {
    let pollCount = 0;
    const maxPolls = 120;

    pollingRef.current = setInterval(async () => {
      pollCount++;

      if (pollCount > maxPolls) {
        clearInterval(pollingRef.current);
        setPaymentStatus('TIMEOUT');
        setError('Payment timeout. Redirecting...');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/payments/edc/status/${orderId}`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });

        if (!response.ok) throw new Error('Failed to check status');

        const result = await response.json();

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
          setError('Payment failed or cancelled. Redirecting...');
          clearInterval(pollingRef.current);
          setTimeout(() => navigate('/'), 2000);
        }

      } catch (error) {
        console.error('EDC Status Check Error:', error);
        // Continue polling on network errors
      }
    }, 3000);
  };

  // ============================================
  // CASH PAYMENT HANDLERS
  // ============================================

  const handleCashPayment = async () => {
    if (!cashPin || cashPin.length === 0) {
      setError('Please enter a PIN');
      return;
    }

    setLoadingCash(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/payments/cash/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          order_id: orderId,
          amount_paise: amountInPaise,
          store_id: "teststore1",
          pin: cashPin
        })
      });

      if (!response.ok) throw new Error('Failed to process cash payment');

      const result = await response.json();

      if (result.payment_status === 'COMPLETED') {
        setPaymentStatus('SUCCESS');
        setTransactionDetails(result);
        setKDSInvoiceId(result.kds_invoice_id);
        setCashData(result);
        setTimerActive(false);
        clearCart();
        localStorage.removeItem('restaurantCart');
        setShowTokenPage(true);
      } else {
        setPaymentStatus('FAILED');
        setError('Cash payment failed. Please try again.');
      }

    } catch (error) {
      console.error('Cash Payment Error:', error);
      setError('Failed to process cash payment. Please try again.');
      setPaymentStatus('FAILED');
    } finally {
      setLoadingCash(false);
    }
  };

  const handleCashPinSubmit = (e) => {
    if (e.key === 'Enter') {
      handleCashPayment();
    }
  };

  // ============================================
  // CANCEL HANDLER
  // ============================================

  const handleCancelPayment = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    setTimerActive(false);
    navigate('/cart');
  };

  // ============================================
  // PRINT & SHARE HANDLERS
  // ============================================

  const handlePrintKOT = () => {
    const kotHTML = generateKOTBill(orderId, kot_code, KDSInvoiceId, orderDetails);
    openPrintWindow(kotHTML, `KOT-${orderId}`, 1000, 1250);
  };

  const handlePrintBill = () => {
    // 
    const orderType = localStorage.getItem('orderType') === "dine-in" ? 'DINE IN' : "TAKE AWAY";
    console.log("orderId have got : ", orderType)
    const billHTML = generateRestaruentBill(
      orderId,
      kot_code,
      KDSInvoiceId,
      orderDetails,
      orderType,
      transactionDetails,
      '' // WhatsApp number handled by TokenSuccess component
    );
    openPrintWindow(billHTML, `Bill-${orderId}`, 1000, 1200);
  };

  const handlePrintAll = () => {
    const orderType = localStorage.getItem('orderType') === "dine-in" ? 'DINE IN' : "TAKE AWAY";
    printAllBills(
      orderId,
      kot_code,
      KDSInvoiceId,
      orderDetails,
      orderType,
      transactionDetails
    );
  };

  const handleWhatsAppKOT = (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    const message = `*KITCHEN ORDER TICKET*\n\nOrder ID: ${kot_code}\nTransaction ID: ${transactionDetails?.transaction_id || 'N/A'}\nDate: ${new Date().toLocaleString()}\n\n*Items:*\n${orderDetails.items.map(item => `${item.itemName} x${item.quantity}`).join('\n')}\n\nSubtotal: ₹${orderDetails.subtotal.toFixed(2)}\nTax: ₹${orderDetails.tax.toFixed(2)}\nTotal: ₹${orderDetails.total.toFixed(2)}\n\nThank you!`;

    const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // ============================================
  // RENDER TOKEN SUCCESS PAGE
  // ============================================

  if (showTokenPage) {
    return (
      <TokenSuccess
        token={kot_code}
        KDSInvoiceId={KDSInvoiceId}
        orderId={orderId}
        orderDetails={orderDetails}
        transactionDetails={transactionDetails}
        onPrintAll={handlePrintAll}
        onSendWhatsapp={handleWhatsAppKOT}
      />
    );
  }

  // ============================================
  // RENDER PAYMENT PAGE
  // ============================================

  return (
    <div className="payment-root">
      {/* Header */}
      <div className="nav-header">
        <button className="back-button" onClick={() => navigate('/cart')}>
          <IoMdArrowRoundBack size={30} />
        </button>
        <h1 className="nav-title">Payment</h1>
      </div>

      <div className="payment-container">
        {/* Order Summary */}
        <div className="order-summary-compact">
          <h3 className="summary-heading">Order Summary</h3>

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

        {/* Payment Methods Section */}
        <div className="payment-methods-section">
          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <h2 className="payment-heading">Select Payment Method</h2>

          {/* QR Code Payment */}
          <div className={`payment-method-card ${selectedMethod === 'qr' ? 'selected' : ''} ${selectedMethod && selectedMethod !== 'qr' ? 'disabled' : ''}`}>
            <div className="method-header">
              <div className="method-info">
                <QrCode size={24} />
                {/* <span className="method-name">UPI / QR Code</span> */}
              </div>

              <button
                className="direct-pay-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!qrData && !loadingQR && !selectedMethod) {
                    setSelectedMethod('qr');
                    setExpandedMethod('qr');
                    handleGenerateQR();
                  }
                }}
                disabled={loadingQR || qrData || (selectedMethod && selectedMethod !== 'qr')}
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
                  'Pay with UPI/QR'
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
                  <p><strong>Time Remaining:</strong> {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
                </div>

                {paymentStatus === 'PROCESSING' && (
                  <div className="waiting-indicator">
                    <div className="spinner"></div>
                    <p>Waiting for payment confirmation...</p>
                  </div>
                )}

                <button className="cancel-payment-btn" onClick={handleCancelPayment}>
                  Cancel Payment
                </button>
              </div>
            )}
          </div>

          {/* EDC Card Payment */}
          <div className={`payment-method-card ${selectedMethod === 'edc' ? 'selected' : ''} ${selectedMethod && selectedMethod !== 'edc' ? 'disabled' : ''}`}>
            <div className="method-header">
              <div className="method-info">
                <CreditCard size={24} />
                {/* <span className="method-name">Card Payment</span> */}
              </div>

              <button
                className="direct-pay-btn card-pay"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!edcData && !loadingEDC && !selectedMethod) {
                    setSelectedMethod('edc');
                    setExpandedMethod('edc');
                    handleEDCPayment();
                  }
                }}
                disabled={loadingEDC || edcData || (selectedMethod && selectedMethod !== 'edc')}
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
                  'Pay with Card'
                )}
              </button>
            </div>

            {expandedMethod === 'edc' && edcData && (
              <div className="method-content">
                <div className="edc-info">
                  <p className="edc-instruction">Please insert or tap your card on the EDC device</p>
                  <div className="transaction-details">
                    <p><strong>Amount:</strong> ₹{(parseInt(amountInPaise) / 100).toFixed(2)}</p>
                    <p><strong>Time Remaining:</strong> {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
                  </div>
                </div>

                {paymentStatus === 'PROCESSING' && (
                  <div className="waiting-indicator">
                    <div className="spinner"></div>
                    <p>Processing card payment...</p>
                  </div>
                )}

                <button className="cancel-payment-btn" onClick={handleCancelPayment}>
                  Cancel Payment
                </button>
              </div>
            )}
          </div>

          {/* Cash Payment */}
          <div className={`payment-method-card ${selectedMethod === 'cash' ? 'selected' : ''} ${selectedMethod && selectedMethod !== 'cash' ? 'disabled' : ''}`}>
            <div className="method-header">
              <div className="method-info">
                <Wallet size={24} />
                {/* <span className="method-name">Cash Payment</span> */}
              </div>

              <button
                className="direct-pay-btn cash-pay"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!cashData && !loadingCash && !selectedMethod) {
                    setSelectedMethod('cash');
                    setExpandedMethod('cash');
                    setShowCashPinInput(true);
                    setTimeRemaining(100);
                    setTimerActive(true);
                  }
                }}
                disabled={loadingCash || cashData || (selectedMethod && selectedMethod !== 'cash')}
              >
                {loadingCash ? (
                  <>
                    <Loader size={18} className="spinning" />
                    Processing...
                  </>
                ) : cashData ? (
                  <>
                    <Check size={18} />
                    Completed
                  </>
                ) : (
                  'Pay with Cash'
                )}
              </button>
            </div>

            {expandedMethod === 'cash' && showCashPinInput && (
              <div className="method-content">
                <div className="cash-info">
                  <p className="cash-instruction">Please enter your PIN to complete the cash payment</p>
                  <div className="pin-input-container">
                    <input
                      type="password"
                      className="pin-input"
                      placeholder="PIN"
                      value={cashPin}
                      onChange={(e) => setCashPin(e.target.value)}
                      onKeyPress={handleCashPinSubmit}
                      maxLength={4}
                      autoFocus
                    />
                    <button
                      className="submit-pin-btn"
                      onClick={handleCashPayment}
                      disabled={!cashPin || loadingCash}
                    >
                      {loadingCash ? 'Processing...' : 'Submit'}
                    </button>
                  </div>
                  <div className="transaction-details">
                    <p><strong>Amount:</strong> ₹{(parseInt(amountInPaise) / 100).toFixed(2)}</p>
                    <p><strong>Time Remaining:</strong> {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
                  </div>
                </div>

                <button className="cancel-payment-btn" onClick={handleCancelPayment}>
                  Cancel Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
