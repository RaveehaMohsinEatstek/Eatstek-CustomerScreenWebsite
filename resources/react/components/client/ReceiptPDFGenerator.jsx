import React from 'react';

const ReceiptPDFGenerator = {
  generate: async (orderData, details, tableNumber, orderNumber, dateTime, day, date) => {
    try {
       const { jsPDF } = window.jspdf;
      const html2canvas = window.html2canvas;
      // Create a temporary container for the receipt
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '300px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '10px';
      document.body.appendChild(tempContainer);

      // Create the receipt content
      const receiptContent = document.createElement('div');
      receiptContent.innerHTML = `
        <div style="font-family: monospace; font-size: 12px; line-height: 1.2; color: black; width: 280px;">
          ${details?.branch_name ? `
            <h1 style="text-align: center; font-weight: 900; font-size: 16px; margin-bottom: 8px; text-transform: uppercase;">
              ${details.branch_name}
            </h1>
          ` : ''}
          
          <div style="text-align: center; margin-bottom: 10px;">
            ${details?.branch_address ? `<div style="font-size: 9px;">${details.branch_address}</div>` : ''}
            ${details?.branch_address2 ? `<div style="font-size: 9px;">${details.branch_address2}</div>` : ''}
            ${details?.phone_no ? `<div style="font-size: 9px;">${details.phone_no}</div>` : ''}
            ${details?.email ? `<div style="font-size: 9px;">${details.email}</div>` : ''}
            ${details?.website ? `<div style="font-size: 9px;">${details.website}</div>` : ''}
          </div>

          <div style="margin: 8px 0;">
            <div style="text-align: center; font-size: 12px;">
              Created - ${dateTime} - Customer Screen Website
            </div>
            <div style="text-align: center; font-weight: bold; font-size: 14px; margin: 6px 0;">
              ---Payment Pending---
            </div>
            <div style="text-align: center; font-weight: bold; font-size: 14px;">
              Order No: ${orderNumber}
            </div>
            <div style="text-align: center; font-size: 12px;">
              Table No: ${tableNumber}
            </div>
            <div style="text-align: center; font-size: 12px;">
              Payment Status: Pay at counter
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10px;">
            <thead>
              <tr style="border-bottom: 1px solid black;">
                <th style="padding: 4px; text-align: left;">Qty</th>
                <th style="padding: 4px; text-align: left;">Name</th>
                <th style="padding: 4px; text-align: left;">Price</th>
                <th style="padding: 4px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.cart.single.map(item => {
                const itemPrice = parseFloat(item.price || item.itemTotal || 0);
                const unitPrice = item.itemTotal ? (itemPrice / item.quantity) : itemPrice;
                const totalPrice = itemPrice * (item.itemTotal ? 1 : item.quantity);

                return `
                  <tr>
                    <td style="padding: 2px; vertical-align: top;">${item.quantity}</td>
                    <td style="padding: 2px; vertical-align: top;">
                      <div style="font-weight: bold;">- ${item.product_name || item.name} (${item.size || 'Regular'})</div>
                      ${item.choices ? item.choices.map(choice => {
                        const groupedChoices = (choice?.choice_options && choice.choice_options.length > 0)
                          ? choice.choice_options.reduce((acc, option) => {
                            const name = option?.choice_name;
                            if (!acc[name]) acc[name] = [];
                            acc[name].push(option.option_name);
                            return acc;
                          }, {})
                          : {};

                        return Object.entries(groupedChoices).map(([choiceName, options]) =>
                          `<div style="font-size: 8px;">● ${choiceName} - ${options.join(', ')}</div>`
                        ).join('');
                      }).join('') : ''}
                      ${item.addonss && item.addonss.length > 0 ? `<div style="font-size: 8px;">● Addons: ${item.addonss.join(', ')}</div>` : ''}
                    </td>
                    <td style="padding: 2px; vertical-align: top;">£${unitPrice.toFixed(2)}</td>
                    <td style="padding: 2px; text-align: right; vertical-align: top;">£${totalPrice.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
              
              ${orderData.cart.deal.map(item => {
                const itemPrice = parseFloat(item.price || item.itemTotal || 0);
                const unitPrice = item.itemTotal ? (itemPrice / item.quantity) : itemPrice;
                const totalPrice = itemPrice * (item.itemTotal ? 1 : item.quantity);

                return `
                  <tr>
                    <td style="padding: 2px; vertical-align: top;">${item.quantity}</td>
                    <td style="padding: 2px; vertical-align: top;">
                      <div style="font-weight: bold;">- ${item.name}</div>
                      ${item.selectedProducts ? item.selectedProducts.map(product =>
                        product.selected_products ? product.selected_products.map(selectedProduct => {
                          const groupedChoices = (selectedProduct.choices || []).reduce((acc, choice) => {
                            const choiceName = choice.choice_name;
                            if (!acc[choiceName]) acc[choiceName] = [];
                            acc[choiceName].push(choice.name);
                            return acc;
                          }, {});

                          return `
                            <div style="font-size: 8px;">● ${selectedProduct.product_name} (${product.category_name})</div>
                            ${Object.entries(groupedChoices).map(([choiceName, options]) =>
                              `<div style="font-size: 8px; margin-left: 10px;">${choiceName}: ${options.join(', ')}</div>`
                            ).join('')}
                          `;
                        }).join('') : ''
                      ).join('') : ''}
                    </td>
                    <td style="padding: 2px; vertical-align: top;">£${unitPrice.toFixed(2)}</td>
                    <td style="padding: 2px; text-align: right; vertical-align: top;">£${totalPrice.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div style="margin: 8px 0; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>Total Payment</span>
              <span>£${orderData.totalBill.toFixed(2)}</span>
            </div>
          </div>

          <div style="text-align: center; margin: 8px 0;">
            <span>Placed On: ${day}, ${date}</span>
          </div>

          <div style="text-align: center; font-weight: bold; margin: 8px 0;">
            Please Pay at Counter
          </div>

          <div style="text-align: center; font-weight: bold; margin-top: 16px;">
            Thank You For Your Order!
          </div>
        </div>
      `;

      tempContainer.appendChild(receiptContent);

      // Generate PDF using html2canvas and jsPDF
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Thermal printer size
      });

      const imgWidth = 70;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight);

      // Save the PDF
      pdf.save(`Receipt_Order_${orderNumber}_Table_${tableNumber}.pdf`);

      // Clean up
      document.body.removeChild(tempContainer);

      return true;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }
};

export default ReceiptPDFGenerator;