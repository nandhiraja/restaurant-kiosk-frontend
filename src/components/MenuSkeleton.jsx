import React from 'react';
import { IoMdArrowRoundBack } from "react-icons/io";
import './Styles/MenuSkeleton.css';

const MenuSkeleton = () => {
  return (
    <div className="menu-container">
      {/* Skeleton Header */}
      <div className="menu-header">
        <div className="skeleton-back-btn"></div>
        <div className="skeleton-title"></div>
      </div>

      {/* Skeleton Grid */}
      <div className="menu-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="skeleton-card">
            <div className="skeleton-card-inner">
              <div className="skeleton-image"></div>
              <div className="skeleton-label">
                <div className="skeleton-label-inner">
                  <div className="skeleton-text"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuSkeleton;
