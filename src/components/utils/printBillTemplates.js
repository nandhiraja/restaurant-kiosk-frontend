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
          border: 2px solid #000;
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
            <span class="label">BILL NO:</span> KTR-${orderId.slice(4,10)}
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
          border: 2px solid #000;
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
          <div class="section-title">TAX INVOICE</div>
        </div>

        <div class="divider-full"></div>

        <div class="kot-block">
          <div>KOT-ID: ${kot_code}</div>
          <div>KDS Invoice ID: ${KDSInvoiceId}</div>
        </div>

        <div class="divider-full"></div>

        <div class="bill-info">BILL NO: KTR-${orderId.slice(4,10)}</div>
        <div class="bill-info">Order No:</div>
        <br/>
        <div class="bill-info">DATE: ${new Date().toLocaleDateString('en-GB')}</div>
        <div class="bill-info">TIME: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
        <div class="bill-info">TYPE: ${orderDetails.billType || 'DINE IN'}</div>
        <div class="bill-info">KIOSK: ${orderDetails.kiosk || 'KTR1'}</div>
        <div class="bill-info">PAYMENT Mode:</div>

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



// utils/printTemplates.js



// export const openPrintWindow = (htmlContent, title, width = 300, height = 600) => {
//   const printWindow = window.open('', '', `width=${width},height=${height}`);
//   printWindow.document.write(htmlContent);
//   printWindow.document.close();
//   printWindow.print();
// };


export const openPrintWindow = (htmlContent, title, width, height) => {
  const features = [
    width ? `width=${width}` : '',
    height ? `height=${height}` : ''
  ].filter(Boolean).join(',');

  const printWindow = window.open('', '', features);
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
