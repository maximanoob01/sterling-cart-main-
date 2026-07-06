import React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Img, Button, Row, Column } from '@react-email/components';

export default function WelcomeEmail({ name = 'Customer' }) {
  return (
    <Html>
      <Head>
        <style>
          {`
            @media only screen and (max-width: 600px) {
              .mobile-container { width: 100% !important; padding: 10px !important; }
              .header-text { font-size: 24px !important; }
              .greeting { font-size: 28px !important; }
              .grid-item { display: block !important; width: 100% !important; margin-bottom: 20px !important; }
              .perk-item { display: block !important; width: 100% !important; margin-bottom: 15px !important; text-align: center !important; }
            }
          `}
        </style>
      </Head>
      <Body style={styles.body}>
        <Container style={styles.container} className="mobile-container">
          
          {/* Hero Header with Image */}
          <Section style={styles.heroSection}>
            {/* Note: In production, replace this Unsplash link with your actual hosted c5.jpeg CDN link */}
            <Img 
              src="https://images.unsplash.com/photo-1599643478524-fb66f453869a?q=80&w=1200&auto=format&fit=crop" 
              width="100%" 
              height="auto" 
              alt="Sterling Kart" 
              style={styles.heroImage} 
            />
            <div style={styles.heroOverlay}>
              <Text style={styles.heroBrand}>✦</Text>
              <Heading style={styles.heroTitle} className="header-text">STERLING KART</Heading>
              <Text style={styles.heroSubtitle}>925 STERLING SILVER JEWELLERY</Text>
              <Text style={styles.heroBrandBottom}>✦</Text>
            </div>
          </Section>

          {/* Welcome Text */}
          <Section style={styles.welcomeSection}>
            <Text style={styles.welcomeScript}>Welcome, ✦</Text>
            <Heading style={styles.greeting} className="greeting">Hi {name}!</Heading>
            <Text style={styles.text}>
              We're thrilled to have you with us.<br/>
              You are now part of a community that<br/>
              celebrates elegance, quality, and timeless<br/>
              925 Sterling Silver Jewellery.
            </Text>
          </Section>

          {/* Loyalty Card */}
          <Section style={styles.loyaltyBox}>
            <Row>
              <Column style={styles.loyaltyLeft}>
                <Img src="https://img.icons8.com/ios-filled/50/ea6c9a/gift--v1.png" width="40" height="40" alt="Gift" />
              </Column>
              <Column style={styles.loyaltyRight}>
                <Text style={styles.loyaltyTitle}>WELCOME GIFT</Text>
                <Heading style={styles.loyaltyAmount}>50</Heading>
                <Text style={styles.loyaltySubtitle}>LOYALTY POINTS</Text>
                <Text style={styles.loyaltyDesc}>Added to your account<br/>as our welcome gift!</Text>
              </Column>
            </Row>
          </Section>

          <Section style={styles.sectionDivider}>
            <Text style={styles.dividerText}>✦ OUR BESTSELLERS ✦</Text>
          </Section>

          {/* Bestsellers Grid */}
          <Section style={styles.bestsellers}>
            <Row>
              <Column style={styles.productCard} className="grid-item">
                <Img src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&auto=format&fit=crop" width="100%" style={styles.productImg} alt="Heart Pendant" />
                <Text style={styles.productName}>Heart Pendant<br/>Necklace</Text>
                <Text style={styles.productPrice}>₹1,499</Text>
                <Button href="https://sterlingkart.in/shop" style={styles.shopBtn}>SHOP NOW</Button>
              </Column>
              <Column style={styles.productCard} className="grid-item">
                <Img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop" width="100%" style={styles.productImg} alt="Infinity Bracelet" />
                <Text style={styles.productName}>Infinity Silver<br/>Bracelet</Text>
                <Text style={styles.productPrice}>₹1,299</Text>
                <Button href="https://sterlingkart.in/shop" style={styles.shopBtn}>SHOP NOW</Button>
              </Column>
            </Row>
            <Row style={{ marginTop: '20px' }}>
              <Column style={styles.productCard} className="grid-item">
                <Img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop" width="100%" style={styles.productImg} alt="Floral Studs" />
                <Text style={styles.productName}>Floral Stud<br/>Earrings</Text>
                <Text style={styles.productPrice}>₹999</Text>
                <Button href="https://sterlingkart.in/shop" style={styles.shopBtn}>SHOP NOW</Button>
              </Column>
              <Column style={styles.productCard} className="grid-item">
                <Img src="https://images.unsplash.com/photo-1605100804763-247f6612d48e?q=80&w=400&auto=format&fit=crop" width="100%" style={styles.productImg} alt="Solitaire Ring" />
                <Text style={styles.productName}>Solitaire Silver<br/>Ring</Text>
                <Text style={styles.productPrice}>₹1,199</Text>
                <Button href="https://sterlingkart.in/shop" style={styles.shopBtn}>SHOP NOW</Button>
              </Column>
            </Row>
          </Section>

          {/* Perks */}
          <Section style={styles.perksBox}>
            <Row>
              <Column style={styles.perkCol} className="perk-item">
                <Text style={styles.perkIcon}>💎</Text>
                <Text style={styles.perkTitle}>PREMIUM QUALITY</Text>
                <Text style={styles.perkDesc}>Finest 925 sterling<br/>silver jewellery</Text>
              </Column>
              <Column style={styles.perkCol} className="perk-item">
                <Text style={styles.perkIcon}>🎁</Text>
                <Text style={styles.perkTitle}>EXCLUSIVE OFFERS</Text>
                <Text style={styles.perkDesc}>Special deals<br/>for our members</Text>
              </Column>
            </Row>
            <Row style={{ marginTop: '20px' }}>
              <Column style={styles.perkCol} className="perk-item">
                <Text style={styles.perkIcon}>⭐</Text>
                <Text style={styles.perkTitle}>EARLY ACCESS</Text>
                <Text style={styles.perkDesc}>Be the first to shop<br/>new arrivals</Text>
              </Column>
              <Column style={styles.perkCol} className="perk-item">
                <Text style={styles.perkIcon}>🚚</Text>
                <Text style={styles.perkTitle}>FAST & SECURE</Text>
                <Text style={styles.perkDesc}>Quick delivery<br/>and easy returns</Text>
              </Column>
            </Row>
          </Section>

          {/* CTA */}
          <Section style={styles.ctaSection}>
            <Button href="https://sterlingkart.in/shop" style={styles.mainBtn}>
              EXPLORE COLLECTION ➔
            </Button>
            <Text style={styles.thankYou}>✦ Thank you for choosing Sterling Kart.</Text>
            <Text style={styles.journey}>We can't wait to be part of your journey!</Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Row>
              <Column style={styles.footerCol} className="perk-item">
                <Text style={styles.footerTitle}>✉ NEED HELP?</Text>
                <Text style={styles.footerText}>support@sterlingkart.com<br/>+91 98765 43210</Text>
              </Column>
              <Column className="perk-item" style={{ ...styles.footerCol, borderLeft: '1px solid #222', borderRight: '1px solid #222' }}>
                <Text style={styles.footerTitle}>FOLLOW US</Text>
                <Text style={styles.footerText}>Instagram | Facebook | Pinterest</Text>
              </Column>
              <Column style={styles.footerCol} className="perk-item">
                <Text style={styles.footerTitle}>🛡 100% SECURE</Text>
                <Text style={styles.footerText}>Safe payments.<br/>Shop with confidence.</Text>
              </Column>
            </Row>
            <Text style={styles.copyright}>© 2026 Sterling Kart. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#050505',
    fontFamily: 'Helvetica, Arial, sans-serif',
    padding: '20px 0',
  },
  container: {
    margin: '0 auto',
    backgroundColor: '#0F1014',
    width: '600px',
    maxWidth: '100%',
    color: '#ffffff',
  },
  heroSection: {
    position: 'relative',
    textAlign: 'center',
    backgroundColor: '#1a1014',
  },
  heroImage: {
    width: '100%',
    height: 'auto',
    opacity: 0.6,
  },
  heroOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    textAlign: 'center',
  },
  heroBrand: { color: '#ea6c9a', margin: '0 0 10px 0', fontSize: '20px' },
  heroBrandBottom: { color: '#ea6c9a', margin: '10px 0 0 0', fontSize: '20px' },
  heroTitle: {
    color: '#ea6c9a',
    fontSize: '36px',
    letterSpacing: '4px',
    margin: '0',
    fontWeight: 'normal',
    fontFamily: 'Georgia, serif',
  },
  heroSubtitle: {
    color: '#ffffff',
    fontSize: '12px',
    letterSpacing: '3px',
    margin: '10px 0 0 0',
    opacity: 0.8,
  },
  welcomeSection: {
    padding: '40px 30px',
  },
  welcomeScript: {
    color: '#ea6c9a',
    fontSize: '24px',
    fontStyle: 'italic',
    margin: '0',
    fontFamily: 'Georgia, serif',
  },
  greeting: {
    color: '#ffffff',
    fontSize: '42px',
    margin: '10px 0 20px 0',
    fontFamily: 'Georgia, serif',
    fontWeight: 'normal',
  },
  text: {
    color: '#b0b0b0',
    fontSize: '15px',
    lineHeight: '1.6',
    margin: '0',
  },
  loyaltyBox: {
    margin: '0 30px 40px 30px',
    border: '1px solid #ea6c9a',
    borderRadius: '12px',
    padding: '30px',
    backgroundColor: 'rgba(234, 108, 154, 0.05)',
  },
  loyaltyLeft: { width: '80px', textAlign: 'center', verticalAlign: 'middle' },
  loyaltyRight: { verticalAlign: 'middle' },
  loyaltyTitle: { color: '#ea6c9a', fontSize: '12px', letterSpacing: '2px', margin: '0' },
  loyaltyAmount: { color: '#ea6c9a', fontSize: '48px', margin: '5px 0', lineHeight: '1' },
  loyaltySubtitle: { color: '#ffffff', fontSize: '14px', letterSpacing: '1px', fontWeight: 'bold', margin: '0 0 10px 0' },
  loyaltyDesc: { color: '#a0a0a0', fontSize: '13px', margin: '0' },
  sectionDivider: {
    textAlign: 'center',
    margin: '20px 0 30px 0',
    borderTop: '1px solid #222',
    paddingTop: '20px',
  },
  dividerText: {
    color: '#ea6c9a',
    fontSize: '14px',
    letterSpacing: '2px',
    margin: '0',
  },
  bestsellers: {
    padding: '0 30px',
  },
  productCard: {
    backgroundColor: '#16181d',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
    margin: '0 5px',
  },
  productImg: { borderRadius: '6px', marginBottom: '15px' },
  productName: { color: '#ffffff', fontSize: '14px', margin: '0 0 5px 0' },
  productPrice: { color: '#a0a0a0', fontSize: '13px', margin: '0 0 15px 0' },
  shopBtn: {
    border: '1px solid #ea6c9a',
    color: '#ea6c9a',
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '12px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  perksBox: {
    margin: '40px 30px',
    backgroundColor: '#16181d',
    borderRadius: '12px',
    padding: '30px 20px',
  },
  perkCol: { textAlign: 'center', padding: '10px' },
  perkIcon: { fontSize: '24px', margin: '0 0 10px 0' },
  perkTitle: { color: '#ffffff', fontSize: '11px', letterSpacing: '1px', fontWeight: 'bold', margin: '0 0 5px 0' },
  perkDesc: { color: '#888', fontSize: '11px', margin: '0' },
  ctaSection: {
    textAlign: 'center',
    padding: '0 30px 40px 30px',
  },
  mainBtn: {
    background: 'linear-gradient(90deg, #ea6c9a 0%, #ff4b72 100%)',
    color: '#ffffff',
    padding: '15px 40px',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: '30px',
  },
  thankYou: { color: '#a0a0a0', fontSize: '14px', margin: '0 0 10px 0' },
  journey: { color: '#ea6c9a', fontSize: '20px', fontStyle: 'italic', fontFamily: 'Georgia, serif', margin: '0' },
  footer: {
    backgroundColor: '#0a0a0d',
    borderTop: '1px solid #222',
    padding: '30px',
  },
  footerCol: { textAlign: 'center', verticalAlign: 'top', padding: '0 10px' },
  footerTitle: { color: '#ea6c9a', fontSize: '11px', letterSpacing: '1px', margin: '0 0 10px 0' },
  footerText: { color: '#888', fontSize: '11px', lineHeight: '1.5', margin: '0' },
  copyright: { color: '#555', fontSize: '10px', textAlign: 'center', marginTop: '30px' },
};
