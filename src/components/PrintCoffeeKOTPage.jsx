import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { generateCoffeeKOT } from './utils/printBillTemplates';
import './Styles/PrintPage.css';

const PrintCoffeeKOTPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId } = useParams();

    const {
        kot_code,
        KDSInvoiceId,
        orderDetails,
        orderType,
        transactionDetails,
        returnPath = '/payment'
    } = location.state || {};

    useEffect(() => {
        // Redirect if no data
        if (!orderId || !orderDetails) {
            navigate(returnPath);
            return;
        }

        // Check if there are coffee items to print
        const coffeeKOTHTML = generateCoffeeKOT(orderId, kot_code, KDSInvoiceId, orderDetails);

        if (!coffeeKOTHTML) {
            // No coffee items, return immediately
            navigate(returnPath);
            return;
        }

        // Set document title for PDF save
        document.title = `Coffee-KOT-${orderId}`;

        // Trigger print after content loads
        const printTimer = setTimeout(() => {
            window.print();
        }, 300);

        // Handle after print event - always return to success page (last in queue)
        const handleAfterPrint = () => {
            navigate(returnPath);
        };

        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            clearTimeout(printTimer);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [orderId, orderDetails, navigate, returnPath, kot_code, KDSInvoiceId, orderType, transactionDetails]);

    if (!orderId || !orderDetails) {
        return null;
    }

    const coffeeKOTHTML = generateCoffeeKOT(orderId, kot_code, KDSInvoiceId, orderDetails);

    if (!coffeeKOTHTML) {
        return null;
    }

    return (
        <div
            className="print-page-container"
            dangerouslySetInnerHTML={{ __html: coffeeKOTHTML }}
        />
    );
};

export default PrintCoffeeKOTPage;
