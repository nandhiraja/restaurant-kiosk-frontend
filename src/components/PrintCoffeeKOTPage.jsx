import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

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

        // Set document title
        document.title = `Coffee-KOT-${orderId}`;

        // Call backend print service
        const printCoffeeKOT = async () => {
            try {
                console.log('[PrintCoffeeKOTPage] Sending print request to backend...');

                const response = await fetch('http://localhost:9100/print/coffee-kot', {
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
                        console.log('[PrintCoffeeKOTPage] ⚠ No coffee items to print');
                    } else {
                        console.log('[PrintCoffeeKOTPage] ✓ Coffee KOT print successful');
                    }
                } else {
                    console.error('[PrintCoffeeKOTPage] ✗ Print failed:', result.error);
                    alert('Print service error: ' + result.error);
                }
            } catch (error) {
                console.error('[PrintCoffeeKOTPage] ✗ Print service connection error:', error);
                alert('Could not connect to print service. Please ensure the service is running.');
            } finally {
                // Navigate to return path (last in queue)
                navigate(returnPath);
            }
        };

        // Trigger print after small delay
        const printTimer = setTimeout(() => {
            printCoffeeKOT();
        }, 300);

        return () => {
            clearTimeout(printTimer);
        };
    }, [orderId, orderDetails, navigate, returnPath, kot_code, KDSInvoiceId, orderType, transactionDetails]);

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
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>☕</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Printing Coffee KOT...</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                KOT: {kot_code}
            </div>
        </div>
    );
};

export default PrintCoffeeKOTPage;
