export const generateKOTBill =(orderId, kot_code, KDSInvoiceId, orderDetails)=>{

return `
    <html>
      <head>
        <title>KOT - ${orderId}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            font-family: 'Courier New', monospace;
            padding: 10px;
            font-size: 13px;
            line-height: 1.5;
            max-width: 280px;
            margin: 0 auto;
            color: #333;
          }
          .center { text-align: center; }
          .restaurant-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            letter-spacing: 1px;
          }
          .location {
            font-size: 12px;
            margin-bottom: 15px;
          }
          .info-line {
            font-size: 12px;
            margin: 3px 0;
          }
          .label {
            display: inline-block;
            min-width: 80px;
          }
          .order-number {
            font-size: 14px;
            margin: 15px 0 10px 0;
            font-weight: bold;
          }
          .divider {
            border-bottom: 1px dashed #666;
            margin: 10px 0;
          }
          .items-header {
            display: flex;
            margin: 15px 0 8px 0;
            font-size: 12px;
            font-weight: bold;
            border-bottom: 1px dashed #333;
            padding-bottom: 5px;
          }
          .items-header .qty-col { flex: 0 0 40px; }
          .items-header .item-col { flex: 1; }
          .item-row {
            display: flex;
            margin: 8px 0;
            font-size: 12px;
            line-height: 1.6;
          }
          .item-row .qty {
            flex: 0 0 40px;
            font-weight: bold;
          }
          .item-row .item-name {
            flex: 1;
            word-wrap: break-word;
          }
          .instruction-section {
            margin-top: 15px;
            font-size: 11px;
          }
          .kot-ids {
            background: #f5f5f5;
            padding: 10px;
            margin: 10px 0;
            border: 1px dashed #999;
            font-size: 11px;
          }
          .footer {
            margin-top: 20px;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="restaurant-name">Karnataka Tiffin Room</div>
          <div class="location">Mumbai</div>
        </div>

        <div class="info-line">
          <span class="label">BILL TYPE:</span> Dine In
        </div>
        <div class="info-line">
          <span class="label">BILL No:</span> KTR${orderId}
        </div>
        <div class="info-line">
          <span class="label">DATE:</span> ${new Date().toLocaleDateString('en-GB')} 
          <span class="label">TIME:</span> ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </div>
        <div class="info-line">
          <span class="label">KIOSK:</span> KTR1
        </div>

        <div class="info-line" style="margin-top: 10px;">
          <span class="label">Name:</span>
        </div>
        <div class="info-line">
          <span class="label">Mob No:</span>
        </div>

        <div class="divider"></div>

        <div class="kot-ids center">
          <div style="margin: 3px 0;"><strong>KOT-ID:</strong> ${kot_code}</div>
          <div style="margin: 3px 0;"><strong>KDS Invoice ID:</strong> ${KDSInvoiceId}</div>
        </div>

        <div class="order-number center">Order No: ${orderId}</div>

        <div class="divider"></div>

        <div class="items-header">
          <div class="qty-col">QTY</div>
          <div class="item-col">ITEMS</div>
        </div>

        ${orderDetails.items.map(item => `
          <div class="item-row">
            <div class="qty">${item.quantity}</div>
            <div class="item-name">${item.itemName}</div>
          </div>
        `).join('')}

        <div class="divider"></div>

        <div class="instruction-section">
          Instruction -
        </div>

        <div class="footer center">
          <div style="margin-top: 25px; font-size: 10px;">** KITCHEN ORDER TICKET **</div>
        </div>
      </body>
    </html>
  `;
};





export  const generateRestaruentBill = 
(orderId, kot_code, KDSInvoiceId, orderDetails, transactionDetails, whatsappNumber) => {
  return `
    <html>
      <head>
        <title>Bill - ${orderId}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            font-family: 'Courier New', monospace;
            padding: 10px 15px;
            font-size: 12px;
            line-height: 1.4;
            max-width: 300px;
            margin: 0 auto;
            color: #333;
          }
          .center { text-align: center; }
          .restaurant-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .tagline {
            font-size: 11px;
            margin-bottom: 8px;
          }
          .info-line {
            font-size: 10px;
            margin: 1px 0;
          }
          .section-title {
            font-weight: bold;
            font-size: 11px;
            margin-top: 10px;
            margin-bottom: 5px;
          }
          .divider {
            border-bottom: 1px dashed #666;
            margin: 8px 0;
          }
          .bill-info {
            font-size: 10px;
            margin: 2px 0;
          }
          .table-header {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-weight: bold;
            margin: 8px 0 5px 0;
            padding-bottom: 3px;
            border-bottom: 1px solid #333;
          }
          .table-header .desc { flex: 2; }
          .table-header .qty { flex: 0.5; text-align: center; }
          .table-header .rate { flex: 1; text-align: right; }
          .table-header .amount { flex: 1; text-align: right; }
          .item-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin: 4px 0;
          }
          .item-row .desc { flex: 2; }
          .item-row .qty { flex: 0.5; text-align: center; }
          .item-row .rate { flex: 1; text-align: right; }
          .item-row .amount { flex: 1; text-align: right; }
          .total-section {
            margin-top: 10px;
            border-top: 1px solid #333;
            padding-top: 5px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin: 3px 0;
          }
          .total-row.grand-total {
            font-weight: bold;
            font-size: 13px;
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px dashed #333;
          }
          .order-number {
            font-size: 11px;
            margin-top: 15px;
            margin-bottom: 5px;
          }
          .order-number-big {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
          }
          .footer {
            margin-top: 20px;
            font-size: 11px;
          }
          .kot-info {
            background: #f0f0f0;
            padding: 8px;
            margin: 10px 0;
            border: 1px dashed #999;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="restaurant-name">Karnataka Tiffin Room</div>
          <div class="tagline">Bringing the flavors of Bengaluru</div>
          <div class="info-line">Mumbai</div>
          <div class="info-line">PH</div>
          <div class="info-line">GST No: 27AA0FH7156G1Z0</div>
          <div class="info-line">SAG No:</div>
          <div class="info-line">CIN No:</div>
          <div class="info-line">FSSAI No: 21524005001190</div>
          <div class="section-title">TAX INVOICE</div>
        </div>

        <div class="divider"></div>

        <div class="kot-info center">
          <div class="bill-info"><strong>KOT-ID:</strong> ${kot_code}</div>
          <div class="bill-info"><strong>KDS Invoice ID:</strong> ${KDSInvoiceId}</div>
        </div>

        <div class="bill-info">BILL No: KTR${orderId}</div>
        <div class="bill-info">Order No: ${orderId}</div>
        <div class="bill-info">DATE: ${new Date().toLocaleDateString('en-GB')}</div>
        <div class="bill-info">TIME: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
        <div class="bill-info">TYPE: Dine In</div>
        <div class="bill-info">KIOSK: KTR1</div>
        <div class="bill-info">PAYMENT: ${transactionDetails?.payment_method || 'PhonePe'}</div>

        <div class="divider"></div>

        <div class="table-header">
          <div class="desc">DESCRIPTION</div>
          <div class="qty">QTY</div>
          <div class="rate">RATE</div>
          <div class="amount">AMOUNT</div>
        </div>

        ${orderDetails.items.map(item => {
          const itemPrice = item.price;
          const itemTotal = itemPrice * item.quantity;
          return `
            <div class="item-row">
              <div class="desc">${item.itemName}</div>
              <div class="qty">${item.quantity}</div>
              <div class="rate">${itemPrice.toFixed(2)}</div>
              <div class="amount">${itemTotal.toFixed(2)}</div>
            </div>
          `;
        }).join('')}

        <div class="total-section">
          <div class="total-row">
            <span>Total</span>
            <span>Rs ${orderDetails.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>CGST</span>
            <span>2.5%</span>
            <span>+${(orderDetails.tax / 2).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>SGST</span>
            <span>2.5%</span>
            <span>+${(orderDetails.tax / 2).toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>PAYABLE AMOUNT</span>
            <span>Rs ${orderDetails.total.toFixed(0)}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="center">
          <div class="order-number">Order No</div>
          <div class="order-number-big">${kot_code}</div>
        </div>

        <div class="divider"></div>

        <div class="footer center">
          <div>Thank You</div>
          ${whatsappNumber ? `<div style="margin-top: 10px;">Bill sent to: ${whatsappNumber}</div>` : ''}
        </div>
      </body>
    </html>
  `;
};





// utils/printTemplates.js



export const openPrintWindow = (htmlContent, title, width = 300, height = 600) => {
  const printWindow = window.open('', '', `width=${width},height=${height}`);
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
};
