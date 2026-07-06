import React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading } from '@react-email/components';

export default function GiftCardEmail({ name, amount, code, expiryDate }) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading style={styles.brandName}>STERLING KART</Heading>
            <Text style={styles.headerSub}>A gift for you!</Text>
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.amount}>Gift Card worth ₹{amount.toLocaleString('en-IN')}</Heading>
            <Text style={styles.text}>Hi {name || 'Customer'},</Text>
            <Text style={styles.text}>
              Here is your Sterling Kart digital gift card. You can use this code during checkout on our store to redeem its value.
            </Text>

            <Section style={styles.codeBox}>
              <Text style={styles.code}>{code}</Text>
            </Section>

            <Text style={styles.expiry}>Valid until: {new Date(expiryDate).toLocaleDateString()}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#1C1C2E',
    fontFamily: 'Inter, Arial, sans-serif',
    padding: '40px 20px',
  },
  container: {
    margin: '0 auto',
    backgroundColor: '#24162A',
    border: '1px solid rgba(212,82,122,0.2)',
    borderRadius: '20px',
    maxWidth: '600px',
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
  },
  header: {
    padding: '30px 20px',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  brandName: {
    color: '#D4527A',
    fontSize: '24px',
    letterSpacing: '2px',
    margin: '0',
  },
  headerSub: {
    color: '#ffffff',
    margin: '10px 0 0 0',
    opacity: 0.8,
  },
  content: {
    padding: '40px 30px',
    textAlign: 'center',
  },
  amount: {
    color: '#ffffff',
    fontSize: '22px',
    margin: '0 0 20px 0',
  },
  text: {
    color: '#cccccc',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 15px 0',
  },
  codeBox: {
    backgroundColor: 'rgba(212,82,122,0.1)',
    border: '1px solid rgba(212,82,122,0.3)',
    borderRadius: '12px',
    padding: '20px',
    margin: '30px 0',
  },
  code: {
    color: '#F4A0B0',
    fontSize: '28px',
    fontWeight: 'bold',
    letterSpacing: '4px',
    margin: '0',
  },
  expiry: {
    color: '#888888',
    fontSize: '13px',
    margin: '0',
  },
};
