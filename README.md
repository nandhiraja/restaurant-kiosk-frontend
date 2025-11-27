

# Restaurant Kiosk Ordering System

A modern self-service kiosk application for restaurant ordering with token generation, print capabilities, and WhatsApp integration.

## Features

- **Self-Service Ordering** - User-friendly interface for customers to place orders
- **Token Generation** - Automated token system for order tracking
- **Print Integration** - Print KOT (Kitchen Order Token) and bills
- **WhatsApp Notifications** - Send order details to customer's mobile number
- **Payment Integration** - Secure payment processing
- **Responsive Design** - Optimized for kiosk touchscreen displays
- **Order Management** - Real-time order tracking and status updates

## Tech Stack

**Frontend:**
- React.js
- React Router
- Lucide React (Icons)
- CSS3 with custom styling

**Backend:**
- Python
- FastAPI/Flask
- KTR Kiosk API integration

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Frontend Setup

```
# Clone the repository
git clone <repository-url>
cd kiosk-project

# Install dependencies
npm install

# Start development server
npm start
```

### Backend Setup

```
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
python app.py
```

## Project Structure

```
kiosk-project/
├── src/
│   ├── components/
│   │   ├── TokenSuccess.jsx
│   │   └── ...
│   ├── Styles/
│   │   ├── TokenSuccess.css
│   │   ├── variables.css
│   │   └── ...
│   └── App.js
├── public/
│   ├── TOP_LEFT.png
│   ├── TOP_RIGHT.png
│   └── ...
├── backend/
│   ├── app.py
│   └── ...
└── README.md
```

## Usage

1. Launch the application on the kiosk device
2. Customer browses menu and adds items to cart
3. Proceed to checkout and complete payment
4. System generates token number
5. Customer can:
   - Print KOT for kitchen reference
   - Print bill for records
   - Receive order details via WhatsApp
   - Start a new order

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=your_backend_api_url
REACT_APP_PAYMENT_KEY=your_payment_gateway_key
```

