import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { generateRestaruentBill } from './utils/printBillTemplates';
import './Styles/PrintPage.css';

const PrintBillPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId } = useParams();

    const {
        kot_code,
        KDSInvoiceId,
        orderDetails,
        orderType,
        transactionDetails,
        printQueue = [],
        returnPath = '/payment'
    } = location.state || {};

    useEffect(() => {
        // Redirect if no data
        if (!orderId || !orderDetails) {
            navigate(returnPath);
            return;
        }

        // Set document title for PDF save
        document.title = `Bill-${orderId}`;

        // Trigger print after content loads
        const printTimer = setTimeout(() => {
            window.print();
        }, 300);

        // Handle after print event
        const handleAfterPrint = () => {
            // Determine next destination
            const nextInQueue = printQueue[0]; // Get first item in queue
            const remainingQueue = printQueue.slice(1); // Remove first item

            if (nextInQueue === 'food-kot') {
                // Navigate to food KOT print
                navigate(`/print/food-kot/${orderId}`, {
                    state: {
                        kot_code,
                        KDSInvoiceId,
                        orderDetails,
                        orderType,
                        transactionDetails,
                        printQueue: remainingQueue,
                        returnPath
                    }
                });
            } else if (nextInQueue === 'coffee-kot') {
                // Navigate to coffee KOT print
                navigate(`/print/coffee-kot/${orderId}`, {
                    state: {
                        kot_code,
                        KDSInvoiceId,
                        orderDetails,
                        orderType,
                        transactionDetails,
                        printQueue: remainingQueue,
                        returnPath
                    }
                });
            } else {
                // No more prints, return to success page
                navigate(returnPath);
            }
        };

        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            clearTimeout(printTimer);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [orderId, orderDetails, navigate, printQueue, returnPath, kot_code, KDSInvoiceId, orderType, transactionDetails]);

    // If no data, show nothing (will redirect)
    if (!orderId || !orderDetails) {
        return null;
    }

    // Generate the bill HTML
    const billHTML = generateRestaruentBill(
        orderId,
        kot_code,
        KDSInvoiceId,
        orderDetails,
        orderType,
        transactionDetails,
        ''
    );

    return (
        <div
            className="print-page-container"
            dangerouslySetInnerHTML={{ __html: billHTML }}
        />
    );
};

export default PrintBillPage;
