

import { generateRestaruentBill, generateFoodKOT, generateCoffeeKOT } from './printBillTemplates';


function printInHiddenIframe(htmlContent, documentTitle) {
    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';

    document.body.appendChild(iframe);

    // Write content to iframe
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Set document title for PDF save filename
    iframeDoc.title = documentTitle;

    // Wait for content to load then print
    iframe.onload = () => {
        setTimeout(() => {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();

                // Remove iframe after a delay
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            } catch (error) {
                console.error('Print error:', error);
                document.body.removeChild(iframe);
            }
        }, 300);
    };
}





// Generate and print bill silently
export const silentPrintBill = (orderId, kot_code, orderDetails, orderType,storeName,ADDRESS_LINE_1,ADDRESS_LINE_2,GST_NUMBER,FSSAI_NUMBER,CIN_NUMBER) => {
    console.log("BILL : ", orderDetails, " -- ", orderType);
    const billHTML = generateRestaruentBill(orderId, kot_code, orderDetails, orderType,storeName,ADDRESS_LINE_1,ADDRESS_LINE_2,GST_NUMBER,FSSAI_NUMBER,CIN_NUMBER);
    printInHiddenIframe(billHTML, `Bill-${orderId}`);
};

// Generate and print Food KOT silently
export const silentPrintFoodKOT = (orderId, kot_code, orderDetails ,orderType,storeName) => {
    console.log("fOOD-KOT : ", orderType);
    const foodKOTHTML = generateFoodKOT(orderId, kot_code, orderDetails,orderType,storeName);
    if (foodKOTHTML) {
        printInHiddenIframe(foodKOTHTML, `Food-KOT-${orderId}`);
    }
};

// Generate and print Coffee KOT silently
export const silentPrintCoffeeKOT = (orderId, kot_code, orderDetails,orderType,storeName) => {
    console.log("COFFEE-KOT : ", orderType);
    const coffeeKOTHTML = generateCoffeeKOT(orderId, kot_code, orderDetails,orderType,storeName);
    if (coffeeKOTHTML) {
        printInHiddenIframe(coffeeKOTHTML, `Coffee-KOT-${orderId}`);
    }
};






// Print all documents silently
export const silentPrintAll = (orderId, kot_code, orderDetails, orderType, storeName,ADDRESS_LINE_1,ADDRESS_LINE_2,GST_NUMBER,FSSAI_NUMBER,CIN_NUMBER) => {

    // Print bill
    silentPrintBill(orderId, kot_code, orderDetails, orderType, storeName,ADDRESS_LINE_1,ADDRESS_LINE_2,GST_NUMBER,FSSAI_NUMBER,CIN_NUMBER);

    // Delay to ensure sequential printing
    setTimeout(() => {
        silentPrintFoodKOT(orderId, kot_code, orderDetails,orderType,storeName);
    }, 500);

    setTimeout(() => {
        silentPrintCoffeeKOT(orderId, kot_code, orderDetails,orderType,storeName);
    }, 1000);
};