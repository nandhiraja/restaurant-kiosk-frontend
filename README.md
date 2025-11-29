
# 🍽️ KTR Restaurant Kiosk System

A modern, responsive self-service kiosk application for restaurant ordering with integrated payment processing and kitchen order management.

##  Features

- **Intuitive Order Flow**: Seamless ordering experience from menu browsing to payment
- **Multiple Order Types**: Support for dine-in and takeaway orders
- **Smart Menu System**: Dynamic category-based menu with real-time data loading
- **Payment Integration**: UPI/QR code and card payment support via PhonePe
- **Cart Management**: Full cart functionality with item quantity controls
- **Token System**: Digital token generation for order tracking
- **Print Integration**: KOT (Kitchen Order Ticket) and bill printing
- **WhatsApp Sharing**: Share order details via WhatsApp
- **Skeleton Loading**: Professional loading states for better UX
- **Fully Responsive**: Optimized for kiosk displays, tablets, and mobile devices

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Context API for state management
- CSS3 with custom design system
- Lucide React icons

**Backend Integration:**
- RESTful API communication
- Payment gateway integration (PhonePe)
- Real-time order processing

**Additional Libraries:**
- qrcode.react - QR code generation
- react-icons - Additional iconography

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API server running

##  Installation

2. Install dependencies:
```
npm install
```

3. Create `.env` file in the root directory:
```
VITE_Base_url=your_backend_api_url
```

4. Start the development server:
```
npm run dev
```

5. Build for production:
```
npm run build
```

## 📱 Usage

1. **Landing Page**: Select order type (Dine In / Take Away)
2. **Menu Page**: Browse categories and select items
3. **Category Items**: View items and add to cart
4. **Cart**: Review order, adjust quantities, proceed to payment
5. **Payment**: Choose payment method (UPI QR / Card)
6. **Token Success**: Receive order token, print receipts

## 📂 Project Structure

```
src/
├── assets/           # Fonts and static assets
├── components/       # React components
│   ├── LandingPage.jsx
│   ├── MenuPage.jsx
│   ├── MenuSection.jsx
│   ├── MenuItemCard.jsx
│   ├── MenuItemModal.jsx
│   ├── CartPage.jsx
│   ├── PaymentPage.jsx
│   ├── TokenSuccess.jsx
│   ├── NavigationBar.jsx
│   └── MenuSkeleton.jsx
├── Styles/          # Component-specific CSS
│   ├── variables.css
│   ├── LandingPage.css
│   ├── MenuPage.css
│   └── ...
├── utils/           # Utility functions
│   └── printBillTemplates.js
├── CartContext.jsx  # Global cart state
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

## 🎨 Design Features

- Custom color scheme with golden accents
- Professional inverted corner card designs
- Smooth animations and transitions
- Skeleton screens for loading states
- Mobile-first responsive design
- Touch-optimized UI elements

## 🔧 Configuration

Update `src/Styles/variables.css` to customize:
- Color schemes
- Typography
- Spacing system
- Border radius
- Shadow effects
