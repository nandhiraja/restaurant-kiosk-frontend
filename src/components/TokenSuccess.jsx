import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './Styles/TokenSuccess.css';
import { Printer, MessageCircle } from 'lucide-react';
import { IoLogoWhatsapp } from "react-icons/io";
import { silentPrintBill, silentPrintFoodKOT, silentPrintCoffeeKOT } from './utils/silentPrint';
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
  const [printStatus, setPrintStatus] = useState('idle'); // 'idle', 'printing', 'success', 'error'
  const [printNotification, setPrintNotification] = useState(''); // User-facing notification message

  // Auto-navigation timer - Only redirect if no errors
  useEffect(() => {
    // Only set timer if print was successful (no errors)
    if (!printError && isPrintSuccess) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000); // 2 seconds

      return () => clearTimeout(timer);
    }
  }, [navigate, printError, isPrintSuccess]);

  // 🔥 AUTOMATED PARALLEL PRINTING WITH FALLBACK - Triggered automatically on page load
  useEffect(() => {

    const autoPrintAll = async () => {
      // Set printing status and show notification
      const orderType = localStorage.getItem('orderType') === "dine-in" ? 'DINE IN' : "TAKE AWAY";
      const ECD_CONFIG_DATA = JSON.parse(localStorage.getItem('kiosk_config'));
      const storeName = ECD_CONFIG_DATA.store_name;

      const VERSOVA_ADDRESS_LINE_1 = "Shop no. 202, Society, JP Rd, Aram Nagar Part 2, Machlimar,";
      const VERSOVA_ADDRESS_LINE_2 = "Versova, Andheri West, Mumbai, Maharashtra 400061";

      const BANDRA_ADDRESS_LINE_1 = "Shop No.36/A, Off Carter Rd, Rizvi Complex, Union Park,";
      const BANDRA_ADDRESS_LINE_2 = " Bandra West, Mumbai, Maharashtra 400050";

      const BANDRA_GST_NUMBER = "27AA0FH7156G1Z0";
      const VERSOVA_GST_NUMBER = "27AA0FH7156G1Z0";

      const BANDRA_FSSAI_NUMBER = "21524005001190";
      const VERSOVA_FSSAI_NUMBER = "21524005001190";

      const BANDRA_CIN_NUMBER = "6731";
      const VERSOVA_CIN_NUMBER = "6731";

      

      let GST_NUMBER = "";
      let ADDRESS_LINE_1 = "";
      let ADDRESS_LINE_2 = "";
      let FSSAI_NUMBER = "";
      let CIN_NUMBER = "";

      if (storeName === "Versova") {
        GST_NUMBER = VERSOVA_GST_NUMBER;
        ADDRESS_LINE_1 = VERSOVA_ADDRESS_LINE_1;
        ADDRESS_LINE_2 = VERSOVA_ADDRESS_LINE_2;
        FSSAI_NUMBER = VERSOVA_FSSAI_NUMBER;
        CIN_NUMBER = VERSOVA_CIN_NUMBER;
      } else {
        GST_NUMBER = BANDRA_GST_NUMBER;
        ADDRESS_LINE_1 = BANDRA_ADDRESS_LINE_1;
        ADDRESS_LINE_2 = BANDRA_ADDRESS_LINE_2;
        FSSAI_NUMBER = BANDRA_FSSAI_NUMBER;
        CIN_NUMBER = BANDRA_CIN_NUMBER;
      }

      console.log("storeName : ", storeName);
      console.log("orderType : ", orderType);
      try {
       

        setPrintNotification('Bills are printing...');
        console.log('[TokenSuccess] 🖨️ Starting automated parallel printing...');
        setPrintStatus('printing');

        // ✅ PRIMARY METHOD: Backend Print Service (Parallel)
        const printResults = await Promise.all([
          fetch('http://localhost:9100/print/food-kot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              kot_code,              
              orderDetails,
              orderType,
              storeName
            })
          }),
          fetch('http://localhost:9100/print/coffee-kot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              kot_code,
              orderDetails,
              orderType,
              storeName
            })
          }),
          fetch('http://localhost:9100/print/bill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              kot_code,
              orderDetails,
              orderType,
              storeName,
              ADDRESS_LINE_1,
              ADDRESS_LINE_2,
              GST_NUMBER,
              FSSAI_NUMBER,
              CIN_NUMBER
            })
          })
        ]);

        // Parse all responses
        const [foodKotResult, coffeeKotResult, billResult] = await Promise.all(
          printResults.map(res => res.json())
        );

        // Track which prints failed for fallback
        const failedPrints = {
          foodKot: !foodKotResult.success && !foodKotResult.skipped,
          coffeeKot: !coffeeKotResult.success && !coffeeKotResult.skipped,
          bill: !billResult.success
        };

        // Log results
        console.log('[TokenSuccess] 📄 Food KOT:', foodKotResult.success ? '✓ Success' : '✗ Failed');
        console.log('[TokenSuccess] ☕ Coffee KOT:', coffeeKotResult.success ? '✓ Success' : '✗ Failed');
        console.log('[TokenSuccess] 🧾 Bill:', billResult.success ? '✓ Success' : '✗ Failed');

        // ⚠️ FALLBACK METHOD: Browser Print (if backend failed)
        const hasFailures = failedPrints.foodKot || failedPrints.coffeeKot || failedPrints.bill;

        if (hasFailures) {
          console.log('[TokenSuccess - Local print Failed] ⚡ Backend print failed, attempting browser print fallback...');

          try {
            // Attempt browser print for failed items
            if (failedPrints.foodKot) {
              console.log('[TokenSuccess - Local print Failed] 🔄 Fallback: Printing Food KOT via browser...');
              silentPrintFoodKOT(orderId, kot_code, orderDetails,orderType,storeName);
            }
            if (failedPrints.coffeeKot) {
              console.log('[TokenSuccess - Local print Failed] 🔄 Fallback: Printing Coffee KOT via browser...');
              silentPrintCoffeeKOT(orderId, kot_code, orderDetails,orderType,storeName);
            }
            if (failedPrints.bill) {
              console.log('[TokenSuccess - Local print Failed] 🔄 Fallback: Printing Bill via browser...');
              silentPrintBill(orderId, kot_code, orderDetails, orderType,storeName,ADDRESS_LINE_1,ADDRESS_LINE_2,GST_NUMBER,FSSAI_NUMBER,CIN_NUMBER);
            }

            // Assume fallback succeeded (browser print doesn't return status)
            console.log('[TokenSuccess] ✅ Fallback print triggered successfully');
            setPrintStatus('success');
            setPrintNotification('Bills printed successfully, please collect them');
            setIsPrintSuccess(true);


          } catch (fallbackError) {
            console.error('[TokenSuccess] ✗ Fallback print also failed:', fallbackError);
            // Both methods failed - show error
            const errors = [];
            if (failedPrints.foodKot) errors.push(`Food KOT: Backend and browser print failed`);
            if (failedPrints.coffeeKot) errors.push(`Coffee KOT: Backend and browser print failed`);
            if (failedPrints.bill) errors.push(`Bill: Backend and browser print failed`);

            setPrintError(errors);
            setPrintStatus('error');
            setPrintNotification('');
          }
        } else {
          // All backend prints successful
          console.log('[TokenSuccess] ✅ All print jobs completed successfully via backend');
          setPrintStatus('success');
          setPrintNotification('Bills printed successfully, please collect them');
          setIsPrintSuccess(true);
        }
      } catch (error) {
        console.error('[TokenSuccess - Try fails] ✗ Backend print service connection error:', error);

        // ⚠️ FALLBACK: Try browser print when backend is unreachable
        console.log('[TokenSuccess - Try fails] ⚡ Backend unreachable, attempting browser print fallback...');


        try {
          silentPrintFoodKOT(orderId, kot_code, orderDetails,orderType,storeName);
          setTimeout(() => {
            silentPrintCoffeeKOT(orderId, kot_code, orderDetails,orderType,storeName);
          }, 500);
          setTimeout(() => {
            silentPrintBill(orderId, kot_code, orderDetails, orderType,storeName,ADDRESS_LINE_1,ADDRESS_LINE_2,GST_NUMBER,FSSAI_NUMBER,CIN_NUMBER);
          }, 1000);

          console.log('[TokenSuccess] ✅ Fallback print triggered successfully');
          setPrintStatus('success');
          setPrintNotification('Bills printed successfully, please collect them');
          setIsPrintSuccess(true);
        } catch (fallbackError) {
          console.error('[TokenSuccess] ✗ Both backend and browser print failed:', fallbackError);
          setPrintError([
            'Could not connect to print service',
            'Browser print fallback also failed',
            `Details: ${error.message}`
          ]);
          setPrintStatus('error');
          setPrintNotification('');
        }
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

            {/* 🔔 PRINT STATUS NOTIFICATION */}
            {printNotification && (
              <div className={`print-notification ${printStatus}`}>
                <div className="print-notification-content">
                  {printStatus === 'printing' && (
                    <div className="print-spinner"></div>
                  )}
                  {printStatus === 'success' && (
                    <span className="print-icon">✓</span>
                  )}
                  <span className="print-message">{printNotification}</span>
                </div>
              </div>
            )}

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