import React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Hr, Img } from '@react-email/components';

export default function OrderConfirmationEmail({ orderId, form, items, totalAmount }) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <div style={styles.heroOverlay}>
              <Heading style={styles.brandName}>STERLING KART</Heading>
              <Text style={styles.headerSub}>ORDER CONFIRMED</Text>
            </div>
          </Section>

          <Section style={styles.content}>
            <Text style={styles.orderId}>ORDER #{orderId}</Text>
            <Heading style={styles.greeting}>Hi {form.fullName || 'Customer'},</Heading>
            <Text style={styles.text}>
              We've received your order and are getting it ready for you. Here are your order details:
            </Text>

            <Section style={styles.tableContainer}>
              <table style={styles.table} width="100%">
                <thead>
                  <tr>
                    <th style={styles.thLeft}>Item</th>
                    <th style={styles.thRight}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td style={styles.tdLeft}>
                        {item.name} x {item.qty}
                        {item.engravingText && (
                          <div style={styles.engraving}>Engraving: "{item.engravingText}"</div>
                        )}
                      </td>
                      <td style={styles.tdRight}>₹{(item.price * item.qty).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ ...styles.tdLeft, ...styles.totalRow }}>Grand Total:</td>
                    <td style={{ ...styles.tdRight, ...styles.totalRow }}>₹{totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section style={styles.addressBox}>
              <Text style={styles.addressTitle}>DELIVERY ADDRESS</Text>
              <Text style={styles.addressText}>
                {form.addressLine1}
                <br />
                {form.addressLine2 ? `${form.addressLine2}\n` : ''}
                {form.city}, {form.state} - {form.pincode}
                <br />
                Phone: {form.phone}
              </Text>
            </Section>
          </Section>

          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>925 Silver Jewels | Hallmarked and Certified</Text>
            <Text style={styles.footerSmallText}>If you have any questions, reply to this email or contact our support.</Text>
            <div style={{ marginTop: '15px' }}>
              <Text style={{ ...styles.footerSmallText, marginBottom: '5px' }}>Follow us on</Text>
              <a href="https://instagram.com/sterling.kart" style={{ display: 'inline-block' }}>
                <Img src="https://img.icons8.com/ios-filled/50/ea6c9a/instagram-new.png" width="20" height="20" alt="Instagram" style={{ display: 'block' }} />
              </a>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#F7E1E8',
    fontFamily: 'Inter, Arial, sans-serif',
    padding: '20px',
  },
  container: {
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '600px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  header: {
    textAlign: 'center', 
    backgroundColor: '#1a1014',
    backgroundImage: 'url("https://raw.githubusercontent.com/maximanoob01/sterling-cart-main-/main/src/assets/images/c5.jpeg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '40px 20px',
  },
  heroOverlay: { 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: '20px', 
    borderRadius: '8px',
    display: 'inline-block'
  },
  brandName: {
    color: '#D4527A',
    fontSize: '24px',
    fontFamily: 'Georgia, serif',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    margin: '0',
  },
  headerSub: {
    color: '#ffffff',
    opacity: 0.9,
    marginTop: '10px',
    margin: '0',
    letterSpacing: '2px',
    fontSize: '12px'
  },
  content: {
    padding: '30px',
  },
  orderId: {
    fontSize: '14px',
    color: '#D4527A',
    fontWeight: 'bold',
    letterSpacing: '1px',
    margin: '0 0 10px 0',
  },
  greeting: {
    fontSize: '20px',
    color: '#1A1A1A',
    fontFamily: 'Georgia, serif',
    margin: '0 0 15px 0',
  },
  text: {
    color: '#666',
    lineHeight: '1.6',
    margin: '0 0 20px 0',
  },
  tableContainer: {
    marginTop: '20px',
  },
  table: {
    borderCollapse: 'collapse',
  },
  thLeft: {
    textAlign: 'left',
    padding: '10px',
    borderBottom: '2px solid #EEE8E5',
    color: '#A8A8A8',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  thRight: {
    textAlign: 'right',
    padding: '10px',
    borderBottom: '2px solid #EEE8E5',
    color: '#A8A8A8',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  tdLeft: {
    padding: '10px',
    borderBottom: '1px solid #EEE8E5',
    color: '#1A1A1A',
  },
  tdRight: {
    padding: '10px',
    borderBottom: '1px solid #EEE8E5',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  engraving: {
    color: '#D4527A',
    fontWeight: '600',
    fontSize: '12px',
    marginTop: '5px',
  },
  totalRow: {
    fontWeight: 'bold',
    color: '#D4527A',
    padding: '15px 10px',
    borderBottom: 'none',
  },
  addressBox: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#F7F5F4',
    borderRadius: '12px',
  },
  addressTitle: {
    margin: '0 0 10px 0',
    color: '#1A1A1A',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: 'bold',
  },
  addressText: {
    color: '#666',
    lineHeight: '1.5',
    margin: '0',
  },
  hr: {
    borderColor: '#EEE8E5',
    margin: '0',
  },
  footer: {
    backgroundColor: '#F7F5F4',
    textAlign: 'center',
    padding: '20px',
  },
  footerText: {
    color: '#A8A8A8',
    fontSize: '12px',
    margin: '0 0 5px 0',
  },
  footerSmallText: {
    color: '#A8A8A8',
    fontSize: '12px',
    margin: '0',
  },
};
