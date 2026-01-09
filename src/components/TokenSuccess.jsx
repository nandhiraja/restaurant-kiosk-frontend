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

  // Auto-navigation timer - 100 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 1000000); // 1000 seconds = 100000ms

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [navigate]);

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
              {/* Single Print All Bills Button */}
              <div className="token-actions-print-group">
                <button className="token-btn token-btn-print-all" onClick={onPrintAll}>
                  <Printer size={20} />
                  <span>Print Bill & KOT</span>
                </button>
              </div>

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
      </div>
    </div>
  );
};

export default TokenSuccess;
