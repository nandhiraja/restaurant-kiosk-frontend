// Coffee Category ID (from backend) - Only coffee, not beverages
const COFFEE_CATEGORY_ID = "9534540";



export const generateRestaruentBill = (
  orderId,
  kot_code,
  orderDetails,
  orderType,
  storeName,
  ADDRESS_LINE_1,
  ADDRESS_LINE_2,
  GST_NUMBER,
  FSSAI_NUMBER,
  CIN_NUMBER
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
        font-family:  Arial, Helvetica, sans-serif; 
        font-size: 11px;
        font-weight: 900;
        line-height: 1.3;
        padding: 2mm 2mm 2mm 6mm;
        margin: 0;
        width: 70mm;
    }
    .page { 
        width: 100%; 
        margin: 0;
        padding: 0;
    }
    .center { text-align: center; }
    .ktr-logo {
          height: 32px; /* Logo size */
          width: auto; /* Maintain aspect ratio */
          object-fit: contain;
        }
    /* Header */
    .restaurant-name-top { 
        font-size: 12px; 
        font-weight: 900; 
        margin-bottom: 1px; 
    }
    .tagline { 
        font-size: 8px; 
        font-weight: 900;
        margin-bottom: 3px; 
    }
    
    /* Logo */
    .logo-wrapper { 
        height: 24px; 
        margin: 3px auto; 
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    /* Branch Info */
    .branch-name { 
        font-size: 11px; 
        font-weight: 900; 
        margin: 2px 0 1px 0; 
    }
    .address-line { 
        font-size: 8px; 
        font-weight: 700;
        line-height: 1.3; 
        margin: 0; 
    }
    
    /* Dividers */
    .divider-full { 
        border-bottom: 2px solid #000; 
        margin: 2px 0; 
    }
    
    /* KOT Code */
    .kot-block { 
        font-size: 11px; 
        font-weight: 900; 
        text-align: center; 
        margin: 3px 0; 
    }
    
    /* Bill Info */
    .bill-info { 
        font-size: 9px; 
        font-weight: 800;
        margin: 1px 0; 
        line-height: 1.4; 
    }
    
    /* Items Table */
    .items-header { 
        display: flex; 
        font-weight: 800; 
        border-bottom: 1px solid #000; 
        padding: 1.4px 0; 
        font-size: 10px; 
        margin-top: 4px; 
    }
    .item-row { 
        display: flex; 
        margin: 1px 0; 
        font-size: 10px; 
        font-weight: 700;
        line-height: 1.3; 
        border-bottom: 1px dashed #000;
    }
    .col-desc { 
        flex: 2.2; 
        padding-right: 1px; 
    }
    .col-qty { 
        flex: 0.7; 
        text-align: center; 
    }
    .col-rate { 
        flex: 0.9; 
        text-align: center; 
        padding-right: 1px; 
    }
    .col-amt { 
        flex: 0.9; 
        text-align: right; 
    }
    
    /* Totals */
    .totals { 
        margin-top: 4px; 
        padding-top: 2px; 
    }
    .total-row { 
        display: flex; 
        justify-content: space-between; 
        font-size: 9px; 
        font-weight: 800;
        margin: 0.5px 0; 
        line-height: 1.4; 
    }
    .grand-total { 
        border-top: 1px solid #000; 
        padding-top: 2px; 
        font-size: 11px; 
        font-weight: 900; 
        margin-top: 2px; 
    }
    
    /* GST Block */
    .gst-block { 
        font-size: 8px; 
        font-weight: 800;
        text-align: center; 
        margin: 4px 0; 
        line-height: 1.3; 
    }
    .gst-line {
        margin: 3px 0;
    }
    
    /* Footer */
    .footer { 
        font-size: 10px; 
        font-weight: 900;
        text-align: center; 
        margin-top: 2px; 
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
          <img class="ktr-logo" src="/Bill-KTR-logo.png" alt="KTR Logo" />
        </div>

        <div class="center">
          <div class="branch-name">${storeName}</div>
          <div class="address-line">
            ${ADDRESS_LINE_1}
          </div>
          <div class="address-line">
            ${ADDRESS_LINE_2}
          </div>
          <!-- <div class="section-title">TAX INVOICE</div> -->
        </div>

        <div class="divider-full"></div>

        <div class="kot-block">
          <div>KOT: ${kot_code}</div>
        </div>

        <div class="divider-full"></div>

        <div class="bill-info">BILL NO: ${orderId}</div>

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
    let basePrice = item.price || 0;
    let customText = '';
    
    if (item.selectedCustomizations) {
        let addonsTotal = 0;
        if (item.selectedCustomizations.addons) {
             const addonNames = [];
             item.selectedCustomizations.addons.forEach(a => {
                 addonsTotal += parseFloat(a.price || 0);
                 addonNames.push(a.name);
             });
             if (addonNames.length > 0) customText += `<br/>Addons: ${addonNames.join(', ')}`;
        }
        
        if (item.selectedCustomizations.variation) {
             basePrice = parseFloat(item.selectedCustomizations.variation.price || 0) + addonsTotal;
             customText = `<br/>Var: ${item.selectedCustomizations.variation.name}` + customText;
        } else {
             basePrice = (item.price || 0) + addonsTotal;
        }
    }

    const itemPrice = basePrice;
    const itemTotal = itemPrice * item.quantity;
    
    return `
          <div class="item-row">
            <div class="col-desc">${item.itemName}${customText ? `<span style="font-size: 8px;">${customText}</span>` : ''}</div>
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
          <div class="gst-line">GST No: ${GST_NUMBER}</div>
          <div class="gst-line">CIN No: ${CIN_NUMBER}</div>
          <div class="gst-line">FSSAI No: ${FSSAI_NUMBER}</div>
        </div>

        <div class="footer">
          Thank You & Visit us Again
        </div>
      </div>
    </body>
  </html>
  `;
};





// Generate KOT for food items
export const generateFoodKOT = (orderId, kot_code, orderDetails, orderType, storeName) => {
  // Filter out only food items 
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
             font-family:Arial, Helvetica, sans-serif; 
             font-size: 15px;
             font-weight: 900;
             padding: 6px 4mm 6px 5mm;
             margin: 0;
             width: 70mm;
         }
         .center { text-align: center; }

         /* Square KOT Box */
         .box-wrapper { 
             display: flex; 
             justify-content: center; 
             margin: 6px 0;
         }

         .kot-logo {
               height: 28px; /* Logo size */
               width: auto; /* Maintain aspect ratio */
               object-fit: contain;
             }
         .box { 
             border: 3px solid #000; 
             padding: 12px;
             text-align: center; 
             border-radius: 20px;
             width: 90px;
             height: 90px;
             display: flex;
             flex-direction: column;
             align-items: center;
             justify-content: center;
             gap: 2px;
         }
         .medium-text { font-size: 12px; font-weight: 800; }

         .big-text { font-size: 20px; font-weight: 900; }
         .huge-text { font-size: 36px; font-weight: 900; line-height: 1; }
         .divider { border-bottom: 3px solid #000; margin: 5px 0; }
         .item-row { font-size: 14px; font-weight: 900; margin: 8px 0; border-bottom: 1px dashed #000; padding-bottom: 4px; display: flex;}
         .qty { width: 40px; display: inline-block; font-size: 19px; font-weight: 900;}
      
    
    </style>
    </head>
   
   
   
    <body>
        <div class="center">
           <div style="height: 40px; display: flex; align-items: center; justify-content: center;">
                <img class="kot-logo" src="/Bill-KTR-logo.png" alt="KTR Logo" />
           </div>

           <div class="medium-text">${storeName}</div>
           <div class="center big-text">KITCHEN COUNTER</div>           
        </div>

        <div class="box-wrapper">
          <div class="box">
              <div class="huge-text">${kot_code.replace('KTR-', '')}</div>
          </div>
        </div>

        <div style="font-size: 10px;">Bill: ${orderId}</div>  
        <div style="display:flex; justify-content:space-between; font-size: 10px;">
          <span style="font-size: 10px;">Date : ${new Date().toLocaleDateString()}</span>
          <span style="font-size: 10px;">Time : ${new Date().toLocaleTimeString()}</span>
        </div>    
        <div style="font-size: 24px; font-weight: 900; margin: 8px 0; border: 2px dashed #000; padding: 4px; text-align: center; text-transform: uppercase;">
          ${orderType}
        </div>
    
        <div class="divider"></div>

        <div style="margin-bottom:5px; font-weight:900; border-bottom:1px solid #000;">ITEMS:</div>

        ${foodItems.map(item => {
          let customText = '';
          if (item.selectedCustomizations) {
              const parts = [];
              if (item.selectedCustomizations.variation) parts.push(`[Var: ${item.selectedCustomizations.variation.name}]`);
              if (item.selectedCustomizations.addons && item.selectedCustomizations.addons.length > 0) {
                  parts.push(`[Add: ${item.selectedCustomizations.addons.map(a => a.name).join(', ')}]`);
              }
              if (parts.length > 0) customText = `<br/><span style="font-size: 10px; font-weight: bold;">${parts.join(' ')}</span>`;
          }
          return `
          <div class="item-row">
            <span class="qty">${item.quantity}</span>
            <span>${item.itemName}${customText}</span>
          </div>
        `}).join('')}

        <div class="divider"></div>

        
    </body>
  </html>
  `;
};


// Generate KOT for coffee items 
export const generateCoffeeKOT = (orderId, kot_code, orderDetails, orderType, storeName) => {

  // Filter only coffee items using categoryId 
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
          <div class="restaurant-name">Karnataka Tiffin Room (${storeName})</div>
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
          <div style="font-size: 20px; font-weight: 900; margin: 6px 0; border: 2px dashed #000; padding: 4px; text-align: center; text-transform: uppercase;">
            ${orderType}
          </div>
          <div class="info-line">
            <span class="label">BILL NO:</span> KTR-${orderId}
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

        ${coffeeItems.map(item => {
          let customText = '';
          if (item.selectedCustomizations) {
              const parts = [];
              if (item.selectedCustomizations.variation) parts.push(`[Var: ${item.selectedCustomizations.variation.name}]`);
              if (item.selectedCustomizations.addons && item.selectedCustomizations.addons.length > 0) {
                  parts.push(`[Add: ${item.selectedCustomizations.addons.map(a => a.name).join(', ')}]`);
              }
              if (parts.length > 0) customText = `<br/><span style="font-size: 9px; font-weight: normal;">${parts.join(' ')}</span>`;
          }
          return `
          <div class="item-row">
            <span>${item.quantity}</span>
            <span>${item.itemName}${customText}</span>
          </div>
        `}).join('')}

        <div class="divider"></div>

        <div class="instruction-title">
          Instruction: COFFEE COUNTER
        </div>
      </div>
    </body>
  </html>
  `;
};
