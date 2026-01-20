import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

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

        // Set document title
        document.title = `Food-KOT-${orderId}`;

        // Call backend print service
        const printFoodKOT = async () => {
            try {
                console.log('[PrintFoodKOTPage] Sending print request to backend...');

                const response = await fetch('http://localhost:9100/print/food-kot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        orderId,
                        kot_code,
                        KDSInvoiceId,
                        orderDetails
                    })
                });

                const result = await response.json();

                if (result.success) {
                    if (result.skipped) {
                        console.log('[PrintFoodKOTPage] ⚠ No food items to print');
                    } else {
                        console.log('[PrintFoodKOTPage] ✓ Food KOT print successful');
                    }
                } else {
                    console.error('[PrintFoodKOTPage] ✗ Print failed:', result.error);
                    alert('Print service error: ' + result.error);
                }
            } catch (error) {
                console.error('[PrintFoodKOTPage] ✗ Print service connection error:', error);
                alert('Could not connect to print service. Please ensure the service is running.');
            } finally {
                // Navigate to next in queue regardless of print success
                handleAfterPrint();
            }
        };

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

        // Trigger print after small delay
        const printTimer = setTimeout(() => {
            printFoodKOT();
        }, 300);

        return () => {
            clearTimeout(printTimer);
        };
    }, [orderId, orderDetails, navigate, printQueue, returnPath, kot_code, KDSInvoiceId, orderType, transactionDetails]);

    if (!orderId || !orderDetails) {
        return null;
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🍴</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Printing Food KOT...</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                KOT: {kot_code}
            </div>
        </div>
    );
};

export default PrintFoodKOTPage;
