import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { generateFoodKOT } from './utils/printBillTemplates';
import './Styles/PrintPage.css';

const PrintFoodKOTPage = () => {
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

        // Check if there are food items to print
        const foodKOTHTML = generateFoodKOT(orderId, kot_code, KDSInvoiceId, orderDetails);

        if (!foodKOTHTML) {
            // No food items, skip to next in queue
            const nextInQueue = printQueue[0];
            const remainingQueue = printQueue.slice(1);

            if (nextInQueue === 'coffee-kot') {
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
                navigate(returnPath);
            }
            return;
        }

        // Set document title for PDF save
        document.title = `Food-KOT-${orderId}`;

        // Trigger print after content loads
        const printTimer = setTimeout(() => {
            window.print();
        }, 300);

        // Handle after print event
        const handleAfterPrint = () => {
            const nextInQueue = printQueue[0];
            const remainingQueue = printQueue.slice(1);

            if (nextInQueue === 'coffee-kot') {
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
                navigate(returnPath);
            }
        };

        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            clearTimeout(printTimer);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [orderId, orderDetails, navigate, printQueue, returnPath, kot_code, KDSInvoiceId, orderType, transactionDetails]);

    if (!orderId || !orderDetails) {
        return null;
    }

    const foodKOTHTML = generateFoodKOT(orderId, kot_code, KDSInvoiceId, orderDetails);

    if (!foodKOTHTML) {
        return null;
    }

    return (
        <div
            className="print-page-container"
            dangerouslySetInnerHTML={{ __html: foodKOTHTML }}
        />
    );
};

export default PrintFoodKOTPage;
