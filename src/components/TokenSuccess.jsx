import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './Styles/TokenSuccess.css';
import { Printer, MessageCircle } from 'lucide-react';
import { IoLogoWhatsapp } from "react-icons/io";
const TokenSuccess = ({
  token,
  kot_code,
  KDSInvoiceId,
  orderId,
  orderDetails,
  transactionDetails,
  onPrintAll,
  onSendWhatsapp
}) => {

  const navigate = useNavigate();

  const [showWhatsappInput, setShowWhatsappInput] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [printError, setPrintError] = useState(null); // Error state for print failures
  const [isPrintSuccess, setIsPrintSuccess] = useState(false); // Track successful print

  // Auto-navigation timer - Only redirect if no errors
  useEffect(() => {
    // Only set timer if print was successful (no errors)
    if (!printError && isPrintSuccess) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 25000); // 25 seconds

      return () => clearTimeout(timer);
    }
  }, [navigate, printError, isPrintSuccess]);

  // 🔥 AUTOMATED PARALLEL PRINTING - Triggered automatically on page load
  useEffect(() => {
    const autoPrintAll = async () => {
      try {
        console.log('[TokenSuccess] 🖨️ Starting automated parallel printing...');

        // ✅ FAST (Parallel) - All print requests sent simultaneously
        const printResults = await Promise.all([
          fetch('http://localhost:9100/print/food-kot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              kot_code,
              KDSInvoiceId,
              orderDetails
            })
          }),
          fetch('http://localhost:9100/print/coffee-kot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              kot_code,
              KDSInvoiceId,
              orderDetails
            })
          }),
          fetch('http://localhost:9100/print/bill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              kot_code,
              KDSInvoiceId,
              orderDetails,
              orderType: orderDetails?.orderType,
              transactionDetails,
              whatsappNumber: ''
            })
          })
        ]);

        // Parse all responses
        const [foodKotResult, coffeeKotResult, billResult] = await Promise.all(
          printResults.map(res => res.json())
        );

        // Check for any failures
        const errors = [];
        if (!foodKotResult.success && !foodKotResult.skipped) {
          errors.push(`Food KOT: ${foodKotResult.error || 'Unknown error'}`);
        }
        if (!coffeeKotResult.success && !coffeeKotResult.skipped) {
          errors.push(`Coffee KOT: ${coffeeKotResult.error || 'Unknown error'}`);
        }
        if (!billResult.success) {
          errors.push(`Bill: ${billResult.error || 'Unknown error'}`);
        }

        // Log results
        console.log('[TokenSuccess] 📄 Food KOT:', foodKotResult.success ? '✓ Success' : '✗ Failed');
        console.log('[TokenSuccess] ☕ Coffee KOT:', coffeeKotResult.success ? '✓ Success' : '✗ Failed');
        console.log('[TokenSuccess] 🧾 Bill:', billResult.success ? '✓ Success' : '✗ Failed');

        if (errors.length > 0) {
          // Show error modal and stop auto-redirect
          setPrintError(errors);
          console.error('[TokenSuccess] ✗ Print errors occurred:', errors);
        } else {
          // All successful - enable auto-redirect
          setIsPrintSuccess(true);
          console.log('[TokenSuccess] ✅ All print jobs completed successfully (parallel execution)');
        }
      } catch (error) {
        console.error('[TokenSuccess] ✗ Auto-print connection error:', error);
        // Show error modal for connection failure
        setPrintError([
          'Could not connect to print service',
          'Please ensure the print service is running',
          `Details: ${error.message}`
        ]);
      }
    };

    // Trigger automatic printing after a small delay to ensure component is mounted
    const printTimer = setTimeout(() => {
      autoPrintAll();
    }, 500);

    return () => clearTimeout(printTimer);
  }, [orderId, kot_code, KDSInvoiceId, orderDetails, transactionDetails]);

  // Handle error modal close - redirect to home after staff closes
  const handleCloseError = () => {
    setPrintError(null);
    navigate('/');
  };

  const handleWhatsappSend = () => {
    if (whatsappNumber && whatsappNumber.length >= 10) {
      onSendWhatsapp(whatsappNumber);
      setShowWhatsappInput(false);
      setWhatsappNumber('');
    } else {
      alert('Please enter a valid 10-digit phone number');
    }
  };
  const cornerImages = [
    { position: 'top-left', src: 'TOP_LEFT.png', alt: 'Top left decoration' },
    { position: 'top-right', src: 'TOP_RIGHT.png', alt: 'Top right decoration' },
    { position: 'bottom-left', src: 'BOTTOM_LEFT.png', alt: 'Bottom left decoration' },
    { position: 'bottom-right', src: 'BOTTOM_RIGHT.png', alt: 'Bottom right decoration' }
  ];

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };
  return (
    <div className="">
      <div className="kiosk-container">
        {cornerImages.map(({ position, src, alt }) => (
          <div key={position} className={`corner-icon ${position}`}>
            <img src={src} alt={alt} onError={handleImageError} />
          </div>
        ))}

        {/* Border Frame */}
        <div className="token-border-frame">
          {/* Top Center Image */}
          <div className="center-decoration center-top">
            <img
              src="./Token_Success_Center_Image.png"
              alt="decoration"
              className="decoration-image"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>

          {/* Main Content */}
          <div className="token-content">
            <h1 className="token-thank-you">
              Thank you<br />
              for placing the order!
            </h1>


            <div className="token-display-box">
              <img className="token-image-ktr" src="/Bill-KTR-logo.png" alt="KTR-logo" />
              <div className="token-number">{token.slice(4)}</div>
            </div>

            <p className="token-instructions">
              Please collect your token<br />
              and wait for call out ( Average ~15 min )
            </p>

            <div className="token-actions">
              {/* ======================================== */}
              {/* MANUAL PRINT BUTTON - COMMENTED OUT     */}
              {/* Printing is now AUTOMATED on page load  */}
              {/* ======================================== */}
              {/* <div className="token-actions-print-group">
                <button className="token-btn token-btn-print-all" onClick={onPrintAll}>
                  <Printer size={20} />
                  <span>Print Bill & KOT</span>
                </button>
              </div> */}

              {/* Other Actions Group */}
              <div className="token-actions-other-group">
                {/* WhatsApp Button - Commented Out */}
                {/* <button 
                  className="token-btn token-btn-whatsapp" 
                  onClick={() => setShowWhatsappInput(!showWhatsappInput)}
                >
                  <IoLogoWhatsapp size={20} color='green'  />
                  <span>WhatsApp</span>
                </button> */}

                <button
                  className="token-btn"
                  onClick={() => navigate('/')}
                >
                  Start New Order
                </button>
              </div>
            </div>

            {/* WhatsApp Input Section - Commented Out */}
            {/* {showWhatsappInput && (
              <div className="whatsapp-section">
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="whatsapp-input"
                  maxLength="10"
                />
                <button className="whatsapp-send-btn" onClick={handleWhatsappSend}>
                  Send
                </button>
              </div>
            )} */}
          </div>

          {/* Bottom Center Image */}
          <div className="center-decoration center-bottom">
            <img
              src="/images/bottom-decoration.png"
              alt="decoration"
              className="decoration-image"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        </div>

        {/* ⚠️ ERROR MODAL - Shows when print fails */}
        {printError && (
          <div className="print-error-overlay">
            <div className="print-error-modal">
              <div className="print-error-header">
                <span className="print-error-icon">⚠️</span>
                <h2>Print Service Error</h2>
              </div>

              <div className="print-error-content">
                <p className="print-error-message">
                  The following print job(s) failed. Please check the print service and try again.
                </p>

                <ul className="print-error-list">
                  {printError.map((error, index) => (
                    <li key={index} className="print-error-item">
                      <span className="error-bullet">✗</span>
                      {error}
                    </li>
                  ))}
                </ul>

                <div className="print-error-instructions">
                  <strong>Staff Instructions:</strong>
                  <ol>
                    <li>Check if the print service is running</li>
                    <li>Verify printer connections</li>
                    <li>Review the error details above</li>
                    <li>Click "Close & Return" to go back to home page</li>
                  </ol>
                </div>
              </div>

              <div className="print-error-actions">
                <button
                  className="print-error-close-btn"
                  onClick={handleCloseError}
                >
                  Close & Return to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenSuccess;
