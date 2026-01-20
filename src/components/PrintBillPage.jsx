import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

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

        // Set document title
        document.title = `Bill-${orderId}`;

        // Call backend print service instead of window.print()
        const printBill = async () => {
            try {
                console.log('[PrintBillPage] Sending print request to backend...');

                const response = await fetch('http://localhost:9100/print/bill', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        orderId,
                        kot_code,
                        KDSInvoiceId,
                        orderDetails,
                        orderType,
                        transactionDetails,
                        whatsappNumber: ''
                    })
                });

                const result = await response.json();

                if (result.success) {
                    console.log('[PrintBillPage] ✓ Bill print successful');
                } else {
                    console.error('[PrintBillPage] ✗ Print failed:', result.error);
                    alert('Print service error: ' + result.error);
                }
            } catch (error) {
                console.error('[PrintBillPage] ✗ Print service connection error:', error);
                alert('Could not connect to print service. Please ensure the service is running.');
            } finally {
                // Navigate to next in queue regardless of print success
                handleAfterPrint();
            }
        };

        const handleAfterPrint = () => {
            // Determine next destination
            const nextInQueue = printQueue[0];
            const remainingQueue = printQueue.slice(1);

            if (nextInQueue === 'food-kot') {
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

        // Trigger print after small delay to ensure component mounted
        const printTimer = setTimeout(() => {
            printBill();
        }, 300);

        return () => {
            clearTimeout(printTimer);
        };
    }, [orderId, orderDetails, navigate, printQueue, returnPath, kot_code, KDSInvoiceId, orderType, transactionDetails]);

    // If no data, show nothing (will redirect)
    if (!orderId || !orderDetails) {
        return null;
    }

    // Show loading state while print is processing
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🖨️</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Printing Bill...</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                Order: {orderId}
            </div>
        </div>
    );
};

export default PrintBillPage;
