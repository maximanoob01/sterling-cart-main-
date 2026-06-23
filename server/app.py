import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from email_template import generate_order_email_html

load_dotenv()

app = Flask(__name__)
CORS(app)

SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASS = os.getenv('SMTP_PASS')

@app.route('/api/orders/confirmation', methods=['POST'])
def send_confirmation():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        order_id = data.get('orderId', 'N/A')
        form_data = data.get('form', {})
        items = data.get('items', [])
        total_amount = data.get('finalTotalAmount', 0)
        recipient_email = form_data.get('email')

        if not recipient_email:
            return jsonify({'error': 'Recipient email is required'}), 400

        if not SMTP_USER or not SMTP_PASS:
            print("WARNING: SMTP credentials not set. Email not sent.")
            return jsonify({'success': True, 'message': 'Order processed (Email skipped, no creds)'}), 200

        # Construct email
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Order Confirmation - {order_id}"
        msg['From'] = f"Sterling Cart <{SMTP_USER}>"
        msg['To'] = recipient_email

        # Create HTML body
        html_content = generate_order_email_html(order_id, form_data, items, total_amount)
        msg.attach(MIMEText(html_content, 'html'))

        # Connect and send
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()

        return jsonify({'success': True, 'message': 'Email sent successfully'})
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
