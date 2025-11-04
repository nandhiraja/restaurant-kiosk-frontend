import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './components/CartContext';
import{ createBrowserRouter , RouterProvider}  from "react-router-dom"
import MenuSection from "./components/MenuSection"
import HomePage from './components/Home';
import MenuPage from './components/MenuPage'; 
import LandingPage from './components/Landingpage'; 

import CartPage from './components/CartPage';
import PaymentPage from './components/PaymentPage'; // Create this

import { Outlet } from 'react-router-dom';

const Layout = () => (
  <CartProvider>
    <Outlet />
  </CartProvider>
);

// Then in your router
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <LandingPage/> },
      { path: "/dinein", element: <MenuPage/> },
      { path: `/item/:id`, element: <MenuSection/> },
        { path: "/cart", element: <CartPage /> },
      { path: "/payment", element: <PaymentPage /> }

    ]
  }
]);

// Render without CartProvider wrapper
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
);