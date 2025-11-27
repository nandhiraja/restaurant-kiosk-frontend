import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, } from 'react';
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
  onPrintBill,
  onPrintKOT,
  onSendWhatsapp
}) => {

    const navigate = useNavigate();
  
  const [showWhatsappInput, setShowWhatsappInput] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const handleWhatsappSend = () => {
    if (whatsappNumber && whatsappNumber.length >= 10) {
      onSendWhatsapp(whatsappNumber);
      setShowWhatsappInput(false);
      setWhatsappNumber('');
    } else {
      alert('Please enter a valid 10-digit phone number');
    }
  };

  return (
    <div className="">
      <div className="kiosk-container">
        {/* Corner Images */}
        <img 
          src="./TOP_LEFT.png" 
          alt="decoration" 
          className="corner-decoration corner-top-left"
          onError={(e) => e.target.style.display = 'none'}
        />
        <img 
          src="./TOP_RIGHT.png" 
          alt="decoration" 
          className="corner-decoration corner-top-right"
          onError={(e) => e.target.style.display = 'none'}
        />
        <img 
          src="./BOTTOM_LEFT.png" 
          alt="decoration" 
          className="corner-decoration corner-bottom-left"
          onError={(e) => e.target.style.display = 'none'}
        />
        <img 
          src="./BOTTOM_RIGHT.png" 
          alt="decoration" 
          className="corner-decoration corner-bottom-right"
          onError={(e) => e.target.style.display = 'none'}
        />

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
              <div className="token-number">{token}</div>
            </div>

            <p className="token-instructions">
              Please collect your token<br />
              and wait for call out ( Average ~15 min )
            </p>

            <div className="token-actions">
              {/* Print Buttons Group - Horizontal */}
              <div className="token-actions-print-group">
                <button className="token-btn" onClick={onPrintKOT}>
                  <Printer size={20} />
                  <span>Print KOT</span>
                </button>
                <button className="token-btn" onClick={onPrintBill}>
                  <Printer size={20} />
                  <span>Print Bill</span>
                </button>
              </div>

              {/* Other Actions Group - Vertical */}
              <div className="token-actions-other-group">
                <button 
                  className="token-btn token-btn-whatsapp" 
                  onClick={() => setShowWhatsappInput(!showWhatsappInput)}
                >
                  <IoLogoWhatsapp size={20} color='green'  />
                  <span>WhatsApp</span>
                </button>

                <button 
                  className="token-btn"
                  onClick={() => navigate('/')}
                >
                  Start New Order
                </button>
              </div>
            </div>

            {showWhatsappInput && (
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
            )}
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
