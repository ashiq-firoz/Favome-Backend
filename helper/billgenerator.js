function generateInvoiceHTML({
    billNo,
    areaManager,
    products,
    shippingAddress,
    totalCost,
    paymentId,
    orderId,
    invoiceDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
    })
}) {
    // Calculate totals
    const subTotal = products.reduce((sum, product) => sum + (product.netAmount || 0), 0);
    const totalDiscount = products.reduce((sum, product) => sum + (product.discount || 0), 0);
    const finalTotal = totalCost;
    
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount).replace(/^(\D+)/, '₹');
    };

    // Generate product rows
    const generateProductRows = () => {
        return products.map((product, index) => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${product.description}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${product.qty}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(product.rate)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(product.discount)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(product.netAmount)}</td>
            </tr>
        `).join('');
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Invoice #${billNo}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 800px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 20px;">
                <!-- Header -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td width="70%" style="vertical-align: top;">
                            <h2 style="margin: 0; color: #333;">FAVOME PRIVATE LIMITED</h2>
                            <p style="margin: 5px 0; font-size: 14px;">
                                39/11A1,<br>
                                Po. Opp. Ioc Petrol Pump,<br>
                                Thiruvannur, Kozhikode, Kerala 673029<br>
                                Email: favome2024@gmail.com<br>
                                www.favome.com<br>
                                Ph: +914953101384, +914953101163
                            </p>
                        </td>
                        <td width="30%" style="text-align: right; vertical-align: top;">
                            <img src="https://your-domain.com/favome-logo.png" alt="Favome Logo" style="width: 100px; height: auto;">
                        </td>
                    </tr>
                </table>

                <!-- Invoice Details -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                        <td>
                            <h1 style="color: #ff0000; text-align: center; margin: 20px 0;">Payment Invoice</h1>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table width="100%" cellpadding="5" cellspacing="0">
                                <tr>
                                    <td>
                                        <strong>Invoice No:</strong> ${billNo}<br>
                                        <strong>Order ID:</strong> ${orderId}<br>
                                        <strong>Payment ID:</strong> ${paymentId}
                                    </td>
                                    <td style="text-align: right;">
                                        <strong>Date:</strong> ${invoiceDate}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Shipping Address -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                        <td style="padding: 10px; background-color: #f9f9f9;">
                            <strong>Shipping Address:</strong><br>
                            ${shippingAddress.name}<br>
                            ${shippingAddress.street}<br>
                            ${shippingAddress.phone}
                        </td>
                    </tr>
                </table>

                <!-- Products Table -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border-collapse: collapse;">
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">#</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item & Description</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Qty</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rate</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Discount</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Net Amount</th>
                    </tr>
                    ${generateProductRows()}
                </table>

                <!-- Totals -->
                <table width="100%" cellpadding="5" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                        <td width="70%"></td>
                        <td width="30%">
                            <table width="100%" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
                                <tr>
                                    <td><strong>Sub Total:</strong></td>
                                    <td style="text-align: right;">${formatCurrency(subTotal)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Total Discount:</strong></td>
                                    <td style="text-align: right;">${formatCurrency(totalDiscount)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Total:</strong></td>
                                    <td style="text-align: right;">${formatCurrency(finalTotal)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Balance Due:</strong></td>
                                    <td style="text-align: right;">${formatCurrency(0)}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table width="100%" cellpadding="5" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                        <td>
                            <p style="margin: 5px 0;">CARD DELIVERY WITH IN 14 DAYS</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top: 30px;">
                            <table width="100%" cellpadding="5" cellspacing="0">
                                <tr>
                                    <td>
                                        <strong>Area Manager Name:</strong> ${areaManager}<br>
                                    </td>
                                    <td style="text-align: right; vertical-align: bottom;">
                                        <div style="margin-top: 40px; border-top: 1px solid #000; width: 200px; float: right;">
                                            <p style="margin: 5px 0; text-align: center;">Authorized Signature</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

module.exports = {
    generateInvoiceHTML
}