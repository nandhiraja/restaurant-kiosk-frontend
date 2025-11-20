import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, QrCode, ChevronDown, ChevronUp, Printer, Send, Check, Loader } from 'lucide-react';
import './Styles/PaymentPage.css';
import { useCart } from './CartContext';
import TokenSuccess from './TokenSuccess'
const BASE_URL = import.meta.env.VITE_Base_url;

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
        setPaymentStatus('TIMEOUT');
        setError('Payment timeout. Please try again.');
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

  const handlePrintKOT = () => {
const printWindow = window.open('', '', 'width=300,height=600');
printWindow.document.write(`
  <html>
    <head>
      <title>KOT - ${orderId}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body { 
          font-family: 'Courier New', monospace;
          padding: 10px;
          font-size: 13px;
          line-height: 1.5;
          max-width: 280px;
          margin: 0 auto;
          color: #333;
        }
        .center { 
          text-align: center; 
        }
        .restaurant-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
          letter-spacing: 1px;
        }
        .location {
          font-size: 12px;
          margin-bottom: 15px;
        }
        .info-line {
          font-size: 12px;
          margin: 3px 0;
        }
        .label {
          display: inline-block;
          min-width: 80px;
        }
        .order-number {
          font-size: 14px;
          margin: 15px 0 10px 0;
          font-weight: bold;
        }
        .divider {
          border-bottom: 1px dashed #666;
          margin: 10px 0;
        }
        .items-header {
          display: flex;
          margin: 15px 0 8px 0;
          font-size: 12px;
          font-weight: bold;
          border-bottom: 1px dashed #333;
          padding-bottom: 5px;
        }
        .items-header .qty-col {
          flex: 0 0 40px;
        }
        .items-header .item-col {
          flex: 1;
        }
        .item-row {
          display: flex;
          margin: 8px 0;
          font-size: 12px;
          line-height: 1.6;
        }
        .item-row .qty {
          flex: 0 0 40px;
          font-weight: bold;
        }
        .item-row .item-name {
          flex: 1;
          word-wrap: break-word;
        }
        .instruction-section {
          margin-top: 15px;
          font-size: 11px;
        }
        .kot-ids {
          background: #f5f5f5;
          padding: 10px;
          margin: 10px 0;
          border: 1px dashed #999;
          font-size: 11px;
        }
        .footer {
          margin-top: 20px;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="center">
        <div class="restaurant-name">Karnataka Tiffin Room</div>
        <div class="location">Mumbai</div>
      </div>

      <div class="info-line">
        <span class="label">BILL TYPE:</span> Dine In
      </div>
      <div class="info-line">
        <span class="label">BILL No:</span> KTR${orderId}
      </div>
      <div class="info-line">
        <span class="label">DATE:</span> ${new Date().toLocaleDateString('en-GB')} 
        <span class="label">TIME:</span> ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
      </div>
      <div class="info-line">
        <span class="label">KIOSK:</span> KTR1
      </div>

      <div class="info-line" style="margin-top: 10px;">
        <span class="label">Name:</span>
      </div>
      <div class="info-line">
        <span class="label">Mob No:</span>
      </div>

      <div class="divider"></div>

      <div class="kot-ids center">
        <div style="margin: 3px 0;"><strong>KOT-ID:</strong> ${kot_code}</div>
        <div style="margin: 3px 0;"><strong>KDS Invoice ID:</strong> ${KDSInvoiceId}</div>
      </div>

      <div class="order-number center">Order No: ${orderId}</div>

      <div class="divider"></div>

      <div class="items-header">
        <div class="qty-col">QTY</div>
        <div class="item-col">ITEMS</div>
      </div>

      ${orderDetails.items.map(item => `
        <div class="item-row">
          <div class="qty">${item.quantity}</div>
          <div class="item-name">${item.itemName}</div>
        </div>
      `).join('')}

      <div class="divider"></div>

      <div class="instruction-section">
        Instruction -
      </div>

      <div class="footer center">
        <div style="margin-top: 25px; font-size: 10px;">** KITCHEN ORDER TICKET **</div>
      </div>
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
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body { 
          font-family: 'Courier New', monospace;
          padding: 10px 15px;
          font-size: 12px;
          line-height: 1.4;
          max-width: 300px;
          margin: 0 auto;
          color: #333;
        }
        .center { 
          text-align: center; 
        }
        .restaurant-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .tagline {
          font-size: 11px;
          margin-bottom: 8px;
        }
        .info-line {
          font-size: 10px;
          margin: 1px 0;
        }
        .section-title {
          font-weight: bold;
          font-size: 11px;
          margin-top: 10px;
          margin-bottom: 5px;
        }
        .divider {
          border-bottom: 1px dashed #666;
          margin: 8px 0;
        }
        .bill-info {
          font-size: 10px;
          margin: 2px 0;
        }
        .table-header {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: bold;
          margin: 8px 0 5px 0;
          padding-bottom: 3px;
          border-bottom: 1px solid #333;
        }
        .table-header .desc { flex: 2; }
        .table-header .qty { flex: 0.5; text-align: center; }
        .table-header .rate { flex: 1; text-align: right; }
        .table-header .amount { flex: 1; text-align: right; }
        .item-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin: 4px 0;
        }
        .item-row .desc { flex: 2; }
        .item-row .qty { flex: 0.5; text-align: center; }
        .item-row .rate { flex: 1; text-align: right; }
        .item-row .amount { flex: 1; text-align: right; }
        .total-section {
          margin-top: 10px;
          border-top: 1px solid #333;
          padding-top: 5px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin: 3px 0;
        }
        .total-row.grand-total {
          font-weight: bold;
          font-size: 13px;
          margin-top: 5px;
          padding-top: 5px;
          border-top: 1px dashed #333;
        }
        .order-number {
          font-size: 11px;
          margin-top: 15px;
          margin-bottom: 5px;
        }
        .order-number-big {
          font-size: 48px;
          font-weight: bold;
          margin: 10px 0;
        }
        .footer {
          margin-top: 20px;
          font-size: 11px;
        }
        .kot-info {
          background: #f0f0f0;
          padding: 8px;
          margin: 10px 0;
          border: 1px dashed #999;
          border-radius: 3px;
        }
      </style>
    </head>
    <body>
      <div class="center">
        <div class="restaurant-name">Karnataka Tiffin Room</div>
        <div class="tagline">Bringing the flavors of Bengaluru</div>
        <div class="info-line">Mumbai</div>
        <div class="info-line">PH</div>
        <div class="info-line">GST No: 27AA0FH7156G1Z0</div>
        <div class="info-line">SAG No:</div>
        <div class="info-line">CIN No:</div>
        <div class="info-line">FSSAI No: 21524005001190</div>
        <div class="section-title">TAX INVOICE</div>
      </div>

      <div class="divider"></div>

      <div class="kot-info center">
        <div class="bill-info"><strong>KOT-ID:</strong> ${kot_code}</div>
        <div class="bill-info"><strong>KDS Invoice ID:</strong> ${KDSInvoiceId}</div>
      </div>

      <div class="bill-info">BILL No: KTR${orderId}</div>
      <div class="bill-info">Order No: ${orderId}</div>
      <div class="bill-info">DATE: ${new Date().toLocaleDateString('en-GB')}</div>
      <div class="bill-info">TIME: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
      <div class="bill-info">TYPE: Dine In</div>
      <div class="bill-info">KIOSK: KTR1</div>
      <div class="bill-info">PAYMENT: ${transactionDetails?.payment_method || 'PhonePe'}</div>

      <div class="divider"></div>

      <div class="table-header">
        <div class="desc">DESCRIPTION</div>
        <div class="qty">QTY</div>
        <div class="rate">RATE</div>
        <div class="amount">AMOUNT</div>
      </div>

      ${orderDetails.items.map(item => {
        const itemPrice = item.price;
        const itemTotal = itemPrice * item.quantity;
        return `
          <div class="item-row">
            <div class="desc">${item.itemName}</div>
            <div class="qty">${item.quantity}</div>
            <div class="rate">${itemPrice.toFixed(2)}</div>
            <div class="amount">${itemTotal.toFixed(2)}</div>
          </div>
        `;
      }).join('')}

      <div class="total-section">
        <div class="total-row">
          <span>Total</span>
          <span>Rs ${orderDetails.subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>CGST</span>
          <span>2.5%</span>
          <span>+${(orderDetails.tax / 2).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>SGST</span>
          <span>2.5%</span>
          <span>+${(orderDetails.tax / 2).toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span>PAYABLE AMOUNT</span>
          <span>Rs ${orderDetails.total.toFixed(0)}</span>
        </div>
      </div>

      <div class="divider"></div>

        <div class="center">
          <div class="order-number">Order No</div>
          <div class="order-number-big">${kot_code}</div>
        </div>

      <div class="divider"></div>

      <div class="footer center">
        <div>Thank You</div>
        ${whatsappNumber ? `<div style="margin-top: 10px;">Bill sent to: ${whatsappNumber}</div>` : ''}
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
    
    const message = `*KITCHEN ORDER TICKET*\n\nOrder ID: ${kot_code}\nTransaction ID: ${transactionDetails?.transaction_id || 'N/A'}\nDate: ${new Date().toLocaleString()}\n\n*Items:*\n${orderDetails.items.map(item => `${item.itemName} x${item.quantity}`).join('\n')}\n\nSubtotal: ₹${orderDetails.subtotal.toFixed(2)}\nTax: ₹${orderDetails.tax.toFixed(2)}\nTotal: ₹${orderDetails.total.toFixed(2)}\n\nThank you for your order!`;
    
    const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsappInput(false);
    setWhatsappNumber('');
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
                            {/* <p><strong>Order ID:</strong> {qrData.order_id}</p> */}
                            {/* <p><strong>Transaction ID:</strong> {qrData.transaction_id}</p> */}
                            <p><strong>Amount:</strong> ₹{(parseInt(amountInPaise) / 100).toFixed(2)}</p>
                            <p><strong>Expires At:</strong> {new Date(qrData.expires_at).toLocaleString()}</p>
                            {/* <p><strong>Provider:</strong> {qrData.provider}</p> */}
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
                    <span className="method-name">Card</span>
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
                            {/* <p><strong>EDC Reference:</strong> {edcData.edc_reference}</p> */}
                            {/* <p><strong>Device ID:</strong> {edcData.device_id}</p> */}
                            <p><strong>Amount:</strong> ₹{(parseInt(edcData.amount_paise) / 100).toFixed(2)}</p>
                            {/* <p><strong>Status:</strong> {edcData.status}</p> */}
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
