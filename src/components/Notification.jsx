import React, { useEffect } from 'react';
import './Styles/NotificationToast.css';

const NotificationToast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <div className={`notification-toast ${isVisible ? 'show' : ''}`}>
      <div className="toast-content">
        <div className="toast-icon">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="10" cy="10" r="10" fill="#4CAF50"/>
            <path 
              d="M6 10L9 13L14 7" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="toast-message">{message}</p>
        <button className="toast-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
