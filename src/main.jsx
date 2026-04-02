import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { CartProvider } from './components/CartContext';
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import MenuSection from "./components/MenuSection"
import MenuPage from './components/MenuPage';
import LandingPage from './components/Landingpage';
import CartPage from './components/CartPage';
import PaymentPage from './components/PaymentPage'; // Create this
import ConfigPage from './components/ConfigPage'; // Admin config page
import PrintBillPage from './components/PrintBillPage';
import PrintFoodKOTPage from './components/PrintFoodKOTPage';
import PrintCoffeeKOTPage from './components/PrintCoffeeKOTPage';


import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (location.pathname !== '/') {
        timeoutId = setTimeout(() => {
          navigate('/');
        }, 40000); // 40 seconds
      }
    };

    resetTimer();

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [location.pathname, navigate]);

  return (
    <CartProvider>
      <div className="page-border-wrapper">
        <Outlet />
      </div>
    </CartProvider>
  );
};

// Then in your router
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/category", element: <MenuPage /> },
      { path: `/item/:id`, element: <MenuSection /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/payment", element: <PaymentPage /> },
      { path: "/config", element: <ConfigPage /> }, // Admin config route
      { path: "/print/bill/:orderId", element: <PrintBillPage /> },
      { path: "/print/food-kot/:orderId", element: <PrintFoodKOTPage /> },
      { path: "/print/coffee-kot/:orderId", element: <PrintCoffeeKOTPage /> },
      { path: "*", element: <LandingPage /> }


    ]
  }
]);

// Render without CartProvider wrapper
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);