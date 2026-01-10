export const generateKOTBill = (orderId, kot_code, KDSInvoiceId, orderDetails) => {
  return `
  <html>
    <head>
      <title>KOT - ${kot_code}</title>
      <style>
            @page {
          size: 80mm auto;  /* width 80mm, height auto based on content */
          margin: 3mm;
          }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
          padding: 10px;
        }
        .page {
          width: 90mm;
          margin: 0 auto;
          padding: 12px 14px 18px;
          /*border: 2px solid #000;*/
          border-radius: 15px;
        }
        .center {
          text-align: center;
        }
        .restaurant-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .kot-box-wrapper {
          margin-top: 6px;
          display: flex;
          justify-content: center;
        }
        .kot-box {
          border: 2px solid #000;
          border-radius: 10px;
          padding: 6px 18px;
          display: inline-block;
          font-weight: bold;
          font-size: 8px;
          text-transform:uppercase;
        }
        .token-no{
            font-family :poppins;
            font-size: 18px;

        }
        .info-line {
          font-size: 11px;
          margin: 2px 0;
        }
        .label {
          display: inline-block;
          min-width: 85px;
        }
        .divider {
          margin: 8px 0;
          border-bottom: 1px dashed #666;
        }
        .items-header,
        .item-row {
          font-size: 11px;

        }
        .items-header {
          margin: 6px 0 4px;
          border-bottom: 1px dashed #333;
          padding-bottom: 3px;
          font-weight:bold;
        }
        .items-header span:first-child,
        .item-row span:first-child {
          display: inline-block;
          width: 30px;
        }
        .instruction-title {
          margin-top: 10px;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="center">
          <div class="restaurant-name">Karnataka Tiffin Room (Versova)</div>
        </div>

        <div class="kot-box-wrapper">
          <div class="kot-box">
           <center> KOT No
            <div class="token-no">${kot_code}</div>
            </center>
          </div>
        </div>

        <div style="margin-top: 10px;">
          <div class="info-line">
            <span class="label">BILL TYPE:</span> ${orderDetails.billType || 'Dine In'}
          </div>
          <div class="info-line">
            <span class="label">BILL NO:</span> KTR-${orderId.slice(4, 10)}
          </div>
          <div class="info-line">
            <span class="label">DATE:</span> ${new Date().toLocaleDateString('en-GB')}
            &nbsp;&nbsp;TIME: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </div>
          <div class="info-line">
            <span class="label">KIOSK:</span> ${orderDetails.kiosk || 'KTR1'}
          </div>
        </div>

        <div class="divider"></div>

        <div class="items-header">
          <span>QTY</span>
          <span>ITEMS</span>
        </div>

        ${orderDetails.items.map(item => `
          <div class="item-row">
            <span>${item.quantity}</span>
            <span>${item.itemName}</span>
          </div>
        `).join('')}

        <div class="divider"></div>

        <div class="instruction-title">
          Instruction:
        </div>
      </div>
    </body>
  </html>
  `;
};




export const generateRestaruentBill = (
  orderId,
  kot_code,
  KDSInvoiceId,
  orderDetails,
  orderType,
  transactionDetails,
  whatsappNumber
) => {
  return `
  <html>
    <head>
      <title>Bill - ${kot_code}</title>
      <style>
             @page {
          size: 80mm auto;  /* width 80mm, height auto based on content */
          margin: 3mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px;
          line-height: 1.5;
          margin: 0;
          padding: 16px;
        }
        .page {
          width: 90mm;
          margin: 0 auto;
          padding: 22px 26px 26px;
         /* border: 2px solid #000;   Note :  outer boder command*/   
        }
        .center { text-align: center; }

        /* Header text */
        .restaurant-name-top {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .tagline {
          font-size: 10px;
          margin-bottom: 10px;
        }

        /* Logo block */
        .logo-wrapper {
          margin: 6px 0 4px;
          display: flex;
          justify-content: center;
        }
        .logo {
          width: 80px;           /* adjust to your logo */
          height: 40px;
          object-fit: contain;
        }

        .branch-name {
          font-size: 10px;
          font-weight: bold;
          margin-top: 6px;
        }
        .address-line {
          font-size: 9px;
        }
        .section-title {
          font-size: 10px;
          font-weight: bold;
          margin-top: 10px;
        }

        .divider-full {
          border-bottom: 1px solid #000;
          margin: 10px 0;
        }

        .bill-info {
          font-size: 9px;
          margin: 2px 0;
        }

        /* KOT / KDS block */
        .kot-block {
          font-size: 9px;
          text-align: center;
          margin: 8px 0;
        }

        /* Items table */
        .items-header,
        .item-row {
          display: flex;
          font-size: 9px;
        }
        .items-header {
          font-weight: bold;
          margin-top: 8px;
          padding-bottom: 3px;
          border-bottom: 1px solid #000;
        }
        .col-desc { flex: 2.2; }
        .col-qty { flex: 0.6; text-align: center; }
        .col-rate { flex: 1; text-align: right; }
        .col-amt { flex: 1; text-align: right; }
        .item-row {
          margin: 4px 0;
        }

        /* Totals */
        .totals {
          margin-top: 8px;
          border-top: 1px solid #000;
          padding-top: 4px;
          font-size: 9px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;
        }
        .grand-total {
          font-weight: bold;
          margin-top: 4px;
          padding-top: 4px;
          border-top: 1px solid #000;
        }

        /* Bottom GST block */
        .gst-block {
          margin-top: 14px;
          font-size: 9px;
        }
        .gst-line {
          text-align: center;
          margin: 2px 0;
        }
        .footer {
          margin-top: 8px;
          text-align: center;
          font-size: 9px;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="center">
          <div class="restaurant-name-top">Karnataka Tiffin Room</div>
          <div class="tagline">Bringing the flavors of Bengaluru</div>
        </div>

        <!-- LOGO PLACEHOLDER: replace src with your logo path/base64 -->
        <div class="logo-wrapper">
          <img class="logo" src="/Bill-KTR-logo.png" alt="KTR Logo" />
        </div>

        <div class="center">
          <div class="branch-name">KTR-Versova</div>
          <div class="address-line">
            Shop no. 202, Society, JP Rd, Aram Nagar Part 2, Machlimar,
          </div>
          <div class="address-line">
            Versova, Andheri West, Mumbai, Maharashtra 400061
          </div>
          <!-- <div class="section-title">TAX INVOICE</div> -->
        </div>

        <div class="divider-full"></div>

        <div class="kot-block">
          <div>KOT: ${kot_code}</div>
        </div>

        <div class="divider-full"></div>

        <div class="bill-info">BILL NO: ${orderId}</div>
        <div>KDS Invoice ID: ${KDSInvoiceId}</div>

       <!-- <br/> -->
        <div class="bill-info">DATE: ${new Date().toLocaleDateString('en-GB')}</div>
        <div class="bill-info">TIME: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
        <div class="bill-info">TYPE: ${orderType}</div>
        <div class="bill-info">KIOSK: ${orderDetails.kiosk || 'KTR1'}</div>

        <div class="divider-full"></div>

        <div class="items-header">
          <div class="col-desc">DESCRIPTION</div>
          <div class="col-qty">QTY</div>
          <div class="col-rate">RATE</div>
          <div class="col-amt">AMOUNT</div>
        </div>

        ${orderDetails.items.map(item => {
    const itemPrice = item.price;
    const itemTotal = itemPrice * item.quantity;
    return `
          <div class="item-row">
            <div class="col-desc">${item.itemName}</div>
            <div class="col-qty">${item.quantity}</div>
            <div class="col-rate">${itemPrice.toFixed(2)}</div>
            <div class="col-amt">${itemTotal.toFixed(2)}</div>
          </div>
          `;
  }).join('')}

        <div class="totals">
          <div class="total-row">
            <span>Total:</span>
            <span>Rs ${orderDetails.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>CGST 2.5%</span>
            <span>+${(orderDetails.tax / 2).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>SGST 2.5%</span>
            <span>+${(orderDetails.tax / 2).toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>PAYABLE AMOUNT:</span>
            <span>Rs ${orderDetails.total.toFixed(0)}</span>
          </div>
        </div>

        <div class="gst-block">
          <div class="gst-line">GST No: 27AA0FH7156G1Z0</div>
          <div class="gst-line">CIN No: 6731</div>
          <div class="gst-line">FSSAI No: 21524005001190</div>
        </div>

        <div class="footer">
          Thank You & Visit us Again
        </div>
      </div>
    </body>
  </html>
  `;
};
// Coffee Category ID (from backend) - Only coffee, not beverages
const COFFEE_CATEGORY_ID = "6868ca5dc29c8ed4d3c98dd8";

// Generate KOT for non-coffee (food + beverage) items
export const generateFoodKOT = (orderId, kot_code, KDSInvoiceId, orderDetails) => {
  // Filter out only coffee items (beverages stay with food)
  const foodItems = orderDetails.items.filter(item =>
    item.categoryId !== COFFEE_CATEGORY_ID
  );

  if (foodItems.length === 0) {
    return null; // No food items to print
  }

  return `
  <html>
    <head>
      <title>Food KOT - ${kot_code}</title>
      <style>
            @page {
          size: 80mm auto;
          margin: 3mm;
          }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
          padding: 10px;
        }
        .page {
          width: 90mm;
          margin: 0 auto;
          padding: 12px 14px 18px;
          border-radius: 15px;
        }
        .center {
          text-align: center;
        }
        .restaurant-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .kot-box-wrapper {
          margin-top: 6px;
          display: flex;
          justify-content: center;
        }
        .kot-box {
          border: 2px solid #000;
          border-radius: 10px;
          padding: 6px 18px;
          display: inline-block;
          font-weight: bold;
          font-size: 8px;
          text-transform:uppercase;
        }
        .token-no{
            font-family: poppins;
            font-size: 22px;
            font-weight: bold;
            display: flex;
            flex-direction: column; /* Vertical stack */
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .logo-wrapper {
          margin: 4px 0;
          display: flex;
          justify-content: center;
        }
        .kot-logo {
          height: 28px; /* Logo size */
          width: auto; /* Maintain aspect ratio */
          object-fit: contain;
        }
        .info-line {
          font-size: 11px;
          margin: 2px 0;
        }
        .label {
          display: inline-block;
          min-width: 85px;
        }
        .divider {
          margin: 8px 0;
          border-bottom: 1px dashed #666;
        }
        .items-header,
        .item-row {
          font-size: 11px;
        }
        .token-number {
        font-size: 2rem;
          font-weight: 900;
          font-family: poppins;
          text-align: center;
        }
        .items-header {
          margin: 6px 0 4px;
          border-bottom: 1px dashed #333;
          padding-bottom: 3px;
          font-weight:bold;
        }
        .items-header span:first-child,
        .item-row span:first-child {
          display: inline-block;
          width: 30px;
        }
        .instruction-title {
          margin-top: 10px;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="center">
          <div class="restaurant-name">Karnataka Tiffin Room (Versova)</div>
          <div class="logo-wrapper">
           
          </div>
        </div>

        <div class="kot-box-wrapper">
          <div class="kot-box">
          <center>
            <div class="token-no">
              <img class="kot-logo" src="/Bill-KTR-logo.png" alt="KTR Logo" />
              <span class="token-number">${kot_code.slice(4)}</span>
            </div>
            </center>
          </div>
        </div>

        <div style="margin-top: 10px;">
          <div class="info-line">
            <span class="label">BILL TYPE:</span> ${orderDetails.billType || 'Dine In'}
          </div>
          <div class="info-line">
            <span class="label">BILL NO:</span> KTR-${orderId.slice(4, 10)}
          </div>
          <div class="info-line">
            <span class="label">DATE:</span> ${new Date().toLocaleDateString('en-GB')}
            &nbsp;&nbsp;TIME: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </div>
          <div class="info-line">
            <span class="label">KIOSK:</span> ${orderDetails.kiosk || 'KTR1'}
          </div>
        </div>

        <div class="divider"></div>

        <div class="items-header">
          <span>QTY</span>
          <span>ITEMS</span>
        </div>

        ${foodItems.map(item => `
          <div class="item-row">
            <span>${item.quantity}</span>
            <span>${item.itemName}</span>
          </div>
        `).join('')}

        <div class="divider"></div>

        <div class="instruction-title">
          Instruction:
        </div>
      </div>
    </body>
  </html>
  `;
};


// Generate KOT for coffee items only (not beverages)
export const generateCoffeeKOT = (orderId, kot_code, KDSInvoiceId, orderDetails) => {
  // Filter only coffee items using categoryId (not beverages)
  const coffeeItems = orderDetails.items.filter(item =>
    item.categoryId === COFFEE_CATEGORY_ID
  );

  if (coffeeItems.length === 0) {
    return null; // No coffee items to print
  }

  return `
  <html>
    <head>
      <title>Coffee KOT - ${kot_code}</title>
      <style>
            @page {
          size: 80mm auto;
          margin: 3mm;
          }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
          padding: 10px;
        }
        .page {
          width: 90mm;
          margin: 0 auto;
          padding: 12px 14px 18px;
          border-radius: 15px;
        }
        .center {
          text-align: center;
        }
        .restaurant-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .kot-box-wrapper {
          margin-top: 6px;
          display: flex;
          justify-content: center;
        }
        .kot-box {
          border: 2px solid #000;
          border-radius: 10px;
          padding: 6px 18px;
          display: inline-block;
          font-weight: bold;
          font-size: 8px;
          text-transform:uppercase;
          background-color: #fff8dc;
        }
        .token-no{
            font-family: poppins;
            font-size: 22px;
            font-weight: bold;
            display: flex;
            flex-direction: column; /* Vertical stack */
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .logo-wrapper {
          margin: 4px 0;
          display: flex;
          justify-content: center;
        }
        .kot-logo {
          height: 28px; /* Logo size */
          width: auto; /* Maintain aspect ratio */
          object-fit: contain;
        }
        .info-line {
          font-size: 11px;
          margin: 2px 0;
        }
        .label {
          display: inline-block;
          min-width: 85px;
        }
        .divider {
          margin: 8px 0;
          border-bottom: 1px dashed #666;
        }
        .items-header,
        .item-row {
          font-size: 11px;
}
        .items-header {
          margin: 6px 0 4px;
          border-bottom: 1px dashed #333;
          padding-bottom: 3px;
          font-weight:bold;
        }
        .items-header span:first-child,
        .item-row span:first-child {
          display: inline-block;
          width: 30px;
        }
        .instruction-title {
          margin-top: 10px;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="center">
          <div class="restaurant-name">Karnataka Tiffin Room (Versova)</div>
        </div>

        <div class="kot-box-wrapper">
          <div class="kot-box">
           <center> 
            <div class="token-no">
              <img class="kot-logo" src="/Bill-KTR-logo.png" alt="KTR Logo" />
              <span class="token-number">${kot_code.slice(4)}</span>
            </div>
            </center>
          </div>
        </div>

        <div style="margin-top: 10px;">
          <div class="info-line">
            <span class="label">BILL TYPE:</span> ${orderDetails.billType || 'Dine In'}
          </div>
          <div class="info-line">
            <span class="label">BILL NO:</span> KTR-${orderId.slice(4, 10)}
          </div>
          <div class="info-line">
            <span class="label">DATE:</span> ${new Date().toLocaleDateString('en-GB')}
            &nbsp;&nbsp;TIME: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </div>
          <div class="info-line">
            <span class="label">KIOSK:</span> ${orderDetails.kiosk || 'KTR1'}
          </div>
        </div>

        <div class="divider"></div>

        <div class="items-header">
          <span>QTY</span>
          <span>COFFEE ITEMS</span>
        </div>

        ${coffeeItems.map(item => `
          <div class="item-row">
            <span>${item.quantity}</span>
            <span>${item.itemName}</span>
          </div>
        `).join('')}

        <div class="divider"></div>

        <div class="instruction-title">
          Instruction: COFFEE COUNTER
        </div>
      </div>
    </body>
  </html>
  `;
};



// Master function to print all bills - with delays to prevent popup blocking
export const printAllBills = (orderId, kot_code, KDSInvoiceId, orderDetails, orderType, transactionDetails) => {
  // Generate all HTML content first
  const billHTML = generateRestaruentBill(
    orderId,
    kot_code,
    KDSInvoiceId,
    orderDetails,
    orderType,
    transactionDetails,
    ''
  );

  const foodKOTHTML = generateFoodKOT(orderId, kot_code, KDSInvoiceId, orderDetails);
  const coffeeKOTHTML = generateCoffeeKOT(orderId, kot_code, KDSInvoiceId, orderDetails);

  // Open bills with delays to prevent popup blocking
  // 1. Print customer bill immediately
  openPrintWindow(billHTML, `Bill-${orderId}`, 1000, 1200, true);

  // 2. Print food KOT after 500ms delay (if exists)
  if (foodKOTHTML) {
    setTimeout(() => {
      openPrintWindow(foodKOTHTML, `Food-KOT-${orderId}`, 1000, 1250, true);
    }, 500);
  }

  // 3. Print coffee KOT after 1000ms delay (if exists)
  if (coffeeKOTHTML) {
    setTimeout(() => {
      openPrintWindow(coffeeKOTHTML, `Coffee-KOT-${orderId}`, 1000, 1250, true);
    }, 1000);
  }
};



// utils/printTemplates.js



// export const openPrintWindow = (htmlContent, title, width = 300, height = 600) => {
//   const printWindow = window.open('', '', `width=${width},height=${height}`);
//   printWindow.document.write(htmlContent);
//   printWindow.document.close();
//   printWindow.print();
// };


export const openPrintWindow = (htmlContent, title, width, height, autoPrint = false) => {
  const features = [
    width ? `width=${width}` : '',
    height ? `height=${height}` : ''
  ].filter(Boolean).join(',');

  const printWindow = window.open('', '', features);
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();

  if (autoPrint) {
    // Auto-print: trigger print dialog immediately after content loads
    setTimeout(() => {
      printWindow.print();
      // Optional: close window after printing (may not work in all browsers)
      // printWindow.onafterprint = () => printWindow.close();
    }, 250); // Small delay to ensure content is fully rendered
  } else {
    printWindow.print();
  }
};
