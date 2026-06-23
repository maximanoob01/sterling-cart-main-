def generate_order_email_html(order_id, form_data, items, total_amount, currency="₹"):
    items_html = ""
    for item in items:
        price = item.get('price', 0)
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #EEE8E5; color: #1A1A1A;">
                {item.get('name')} x {item.get('quantity')}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #EEE8E5; color: #1A1A1A; text-align: right;">
                {currency}{price * item.get('quantity')}
            </td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Inter', Arial, sans-serif; background-color: #F7E1E8; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }}
            .header {{ background-color: #1A1A1A; color: #ffffff; text-align: center; padding: 30px 20px; }}
            .header h1 {{ margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; color: #D4527A; }}
            .content {{ padding: 30px; }}
            .order-title {{ font-size: 20px; color: #1A1A1A; font-family: Georgia, serif; margin-bottom: 20px; }}
            .order-id {{ font-size: 14px; color: #D4527A; font-weight: bold; letter-spacing: 1px; }}
            .details-table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            .total-row {{ font-weight: bold; font-size: 16px; color: #D4527A; }}
            .footer {{ background-color: #F7F5F4; text-align: center; padding: 20px; font-size: 12px; color: #A8A8A8; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Sterling Cart</h1>
                <p style="margin-top: 10px; color: #ffffff; opacity: 0.8;">Thank you for your order!</p>
            </div>
            <div class="content">
                <p class="order-id">ORDER #{order_id}</p>
                <p class="order-title">Hi {form_data.get('fullName', 'Customer')},</p>
                <p style="color: #666; line-height: 1.6;">We've received your order and are getting it ready for you. Here are your order details:</p>
                
                <table class="details-table">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #EEE8E5; color: #A8A8A8; font-size: 12px; text-transform: uppercase;">Item</th>
                            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #EEE8E5; color: #A8A8A8; font-size: 12px; text-transform: uppercase;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                        <tr>
                            <td style="padding: 15px 10px; text-align: right;" class="total-row">Grand Total:</td>
                            <td style="padding: 15px 10px; text-align: right;" class="total-row">{currency}{total_amount}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="margin-top: 30px; padding: 20px; background-color: #F7F5F4; border-radius: 12px;">
                    <h3 style="margin-top: 0; color: #1A1A1A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Delivery Address</h3>
                    <p style="color: #666; line-height: 1.5; margin-bottom: 0;">
                        {form_data.get('addressLine1')}<br>
                        {form_data.get('addressLine2') + '<br>' if form_data.get('addressLine2') else ''}
                        {form_data.get('city')}, {form_data.get('state')} - {form_data.get('pincode')}<br>
                        Phone: {form_data.get('phone')}
                    </p>
                </div>
            </div>
            <div class="footer">
                <p>925 Silver Jewels | Hallmarked and Certified</p>
                <p>If you have any questions, reply to this email or contact our support.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html
