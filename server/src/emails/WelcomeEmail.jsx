import React from 'react';
import { Html, Head, Body, Container, Section, Text, Img, Heading, Hr, Button } from '@react-email/components';

export default function WelcomeEmail({ name = 'Customer' }) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading style={styles.brandName}>STERLING KART</Heading>
            <Text style={styles.tagline}>925 SILVER JEWELLERY</Text>
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.greeting}>Welcome to the Sterling Kart Family!</Heading>
            <Text style={styles.text}>Hi {name},</Text>
            <Text style={styles.text}>
              We are thrilled to have you with us. You are now part of a community that celebrates elegance, quality, and timeless 925 Sterling Silver Jewellery.
            </Text>

            <Section style={styles.giftBox}>
              <Text style={styles.giftTitle}>WELCOME GIFT</Text>
              <Heading style={styles.giftAmount}>50 Loyalty Points</Heading>
              <Text style={styles.giftDesc}>Added to your account as our welcome gift!</Text>
            </Section>

            <Button href="https://sterlingkart.in/shop" style={styles.button}>
              EXPLORE COLLECTION
            </Button>
          </Section>

          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>With Love,</Text>
            <Text style={styles.footerText}>Sterling Kart Team</Text>
            <Text style={styles.footerSmallText}>925 Pure Silver | Premium Quality | Secure Packaging</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#fcfcfc',
    fontFamily: 'Inter, Helvetica, Arial, sans-serif',
    padding: '40px 0',
  },
  container: {
    margin: '0 auto',
    backgroundColor: '#ffffff',
    padding: '40px 20px',
    borderRadius: '12px',
    maxWidth: '500px',
    boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
    textAlign: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  brandName: {
    color: '#EA6C9A',
    fontSize: '28px',
    letterSpacing: '2px',
    margin: '0',
  },
  tagline: {
    color: '#999',
    fontSize: '12px',
    letterSpacing: '1.5px',
    margin: '10px 0 0 0',
  },
  content: {
    textAlign: 'center',
  },
  greeting: {
    fontSize: '20px',
    color: '#131E33',
    fontWeight: '600',
  },
  text: {
    fontSize: '15px',
    color: '#333',
    lineHeight: '1.6',
    margin: '15px 0',
  },
  giftBox: {
    backgroundColor: '#fffbfe',
    border: '1px solid #fae8f0',
    borderRadius: '12px',
    padding: '30px 20px',
    margin: '30px 0',
  },
  giftTitle: {
    color: '#EA6C9A',
    fontSize: '12px',
    letterSpacing: '2px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  giftAmount: {
    color: '#EA6C9A',
    fontSize: '32px',
    margin: '0 0 10px 0',
  },
  giftDesc: {
    color: '#131E33',
    fontSize: '14px',
    margin: '0',
  },
  button: {
    backgroundColor: '#071529',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '20px',
  },
  hr: {
    borderColor: '#fae8f0',
    margin: '30px 0',
  },
  footer: {
    textAlign: 'center',
  },
  footerText: {
    color: '#EA6C9A',
    fontSize: '16px',
    margin: '5px 0',
    fontStyle: 'italic',
  },
  footerSmallText: {
    color: '#999',
    fontSize: '12px',
    marginTop: '20px',
  },
};
