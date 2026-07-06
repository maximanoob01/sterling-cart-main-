import React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Img, Button, Row, Column, Hr } from '@react-email/components';

export default function WelcomeEmail({ name = 'Customer' }) {
  return (
    <Html>
      <Head>
        <style>
          {`
            @media only screen and (max-width: 600px) {
              .mobile-container { width: 100% !important; padding: 10px !important; }
              .header-text { font-size: 20px !important; }
              .greeting { font-size: 24px !important; }
              
              /* Force 4 columns to stay on one row by explicitly not stacking */
              .product-name { font-size: 8px !important; margin-bottom: 2px !important; }
              .product-price { font-size: 8px !important; margin-bottom: 5px !important; }
              .shop-btn { padding: 4px 6px !important; font-size: 7px !important; border-width: 1px !important; }
              .product-card { padding: 4px !important; margin: 2px !important; }

              /* Same for perks - stay on one line or two lines max, but user requested proper template without breaking */
              .perk-col { width: 25% !important; padding: 2px !important; }
              .perk-title { font-size: 7px !important; }
              .perk-icon { width: 20px !important; height: 20px !important; }
              
              /* Keep footer columns inline on mobile */
              .footer-col { width: 33.33% !important; padding: 0 2px !important; border: none !important; }
              .footer-title { font-size: 8px !important; }
              .footer-text { font-size: 7px !important; }
            }
          `}
        </style>
      </Head>
      <Body style={styles.body}>
        <Container style={styles.container} className="mobile-container">
          
          {/* Hero Header with Background Image */}
          <Section style={styles.heroSection}>
            <div style={styles.heroOverlay}>
              <Heading style={styles.heroTitle} className="header-text">STERLING KART</Heading>
              <Text style={styles.heroSubtitle}>925 STERLING SILVER JEWELLERY</Text>
            </div>
          </Section>

          {/* Welcome Text */}
          <Section style={styles.welcomeSection}>
            <center>
              <Text style={styles.welcomeScript}>Welcome,</Text>
              <Heading style={styles.greeting} className="greeting">Hi {name}!</Heading>
              <Text style={styles.text}>
                We're thrilled to have you with us.<br/>
                You are now part of a community that<br/>
                celebrates elegance, quality, and timeless<br/>
                925 Sterling Silver Jewellery.
              </Text>
            </center>
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
            <center>
              <Text style={styles.dividerText}>OUR BESTSELLERS</Text>
            </center>
          </Section>

          {/* Bestsellers Grid - ALL 4 ON SINGLE LINE */}
          <Section style={styles.bestsellers}>
            <Row>
              <Column width="25%" style={styles.productCard} className="product-card">
                <Img src="https://raw.githubusercontent.com/maximanoob01/sterling-cart-main-/main/src/assets/images/product_pendant_1.png" width="100%" style={styles.productImg} alt="Heart Pendant" />
                <Text style={styles.productName} className="product-name">Heart Pendant</Text>
                <Text style={styles.productPrice} className="product-price">₹1,499</Text>
                <Button href="https://sterlingkart.in/shop" style={styles.shopBtn} className="shop-btn">SHOP NOW</Button>
              </Column>
              
              <Column width="25%" style={styles.productCard} className="product-card">
                <Img src="https://raw.githubusercontent.com/maximanoob01/sterling-cart-main-/main/src/assets/images/product_bracelet_1.png" width="100%" style={styles.productImg} alt="Infinity Bracelet" />
                <Text style={styles.productName} className="product-name">Infinity Bracelet</Text>
                <Text style={styles.productPrice} className="product-price">₹1,299</Text>
                <Button href="https://sterlingkart.in/shop" style={styles.shopBtn} className="shop-btn">SHOP NOW</Button>
              </Column>
              
              <Column width="25%" style={styles.productCard} className="product-card">
                <Img src="https://raw.githubusercontent.com/maximanoob01/sterling-cart-main-/main/src/assets/images/product_earring_1.png" width="100%" style={styles.productImg} alt="Floral Studs" />
                <Text style={styles.productName} className="product-name">Floral Studs</Text>
                <Text style={styles.productPrice} className="product-price">₹999</Text>
                <Button href="https://sterlingkart.in/shop" style={styles.shopBtn} className="shop-btn">SHOP NOW</Button>
              </Column>
              
              <Column width="25%" style={styles.productCard} className="product-card">
                <Img src="https://raw.githubusercontent.com/maximanoob01/sterling-cart-main-/main/src/assets/images/product_ring_1.png" width="100%" style={styles.productImg} alt="Solitaire Ring" />
                <Text style={styles.productName} className="product-name">Solitaire Ring</Text>
                <Text style={styles.productPrice} className="product-price">₹1,199</Text>
                <Button href="https://sterlingkart.in/shop" style={styles.shopBtn} className="shop-btn">SHOP NOW</Button>
              </Column>
            </Row>
          </Section>

          <Hr style={{ borderColor: '#222', margin: '40px 0' }} />

          {/* Perks - ALL 4 ON SINGLE LINE */}
          <Section style={styles.perksBox}>
            <Row>
              <Column width="25%" style={styles.perkCol} className="perk-col">
                <center><Img src="https://img.icons8.com/ios-filled/50/ea6c9a/diamond.png" width="28" height="28" alt="Premium" className="perk-icon" /></center>
                <Text style={styles.perkTitle} className="perk-title">PREMIUM QUALITY</Text>
                <Text style={styles.perkDesc} className="perk-desc">Finest 925 sterling<br/>silver jewellery</Text>
              </Column>
              <Column width="25%" style={styles.perkCol} className="perk-col">
                <center><Img src="https://img.icons8.com/ios-filled/50/ea6c9a/gift--v1.png" width="28" height="28" alt="Offers" className="perk-icon" /></center>
                <Text style={styles.perkTitle} className="perk-title">EXCLUSIVE OFFERS</Text>
                <Text style={styles.perkDesc} className="perk-desc">Special deals<br/>for our members</Text>
              </Column>
              <Column width="25%" style={styles.perkCol} className="perk-col">
                <center><Img src="https://img.icons8.com/ios-filled/50/ea6c9a/star--v1.png" width="28" height="28" alt="Early Access" className="perk-icon" /></center>
                <Text style={styles.perkTitle} className="perk-title">EARLY ACCESS</Text>
                <Text style={styles.perkDesc} className="perk-desc">Be the first to shop<br/>new arrivals</Text>
              </Column>
              <Column width="25%" style={styles.perkCol} className="perk-col">
                <center><Img src="https://img.icons8.com/ios-filled/50/ea6c9a/truck.png" width="28" height="28" alt="Fast Secure" className="perk-icon" /></center>
                <Text style={styles.perkTitle} className="perk-title">FAST & SECURE</Text>
                <Text style={styles.perkDesc} className="perk-desc">Quick delivery<br/>and easy returns</Text>
              </Column>
            </Row>
          </Section>

          {/* CTA */}
          <Section style={styles.ctaSection}>
            <center>
              <Button href="https://sterlingkart.in/shop" style={styles.mainBtn}>
                EXPLORE COLLECTION ➔
              </Button>
              <Text style={styles.thankYou}>Thank you for choosing Sterling Kart.</Text>
              <Text style={styles.journey}>We can't wait to be part of your journey!</Text>
            </center>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Row>
              <Column width="33.33%" style={styles.footerCol} className="footer-col" align="center" valign="top">
                <Text style={styles.footerTitle} className="footer-title">✉ NEED HELP?</Text>
                <Text style={styles.footerText} className="footer-text">support@sterlingkart.in<br/>+91 98765 43210</Text>
              </Column>
              <Column width="33.33%" style={{ ...styles.footerCol, borderLeft: '1px solid #222', borderRight: '1px solid #222' }} className="footer-col" align="center" valign="top">
                <Text style={styles.footerTitle} className="footer-title">FOLLOW US</Text>
                <div style={{ marginTop: '5px' }}>
                  <a href="https://instagram.com/sterling.kart" style={{ display: 'inline-block', margin: '0 4px' }}>
                    <Img src="https://img.icons8.com/ios-filled/50/ea6c9a/instagram-new.png" width="16" height="16" alt="Instagram" />
                  </a>
                  <a href="https://facebook.com/sterling.kart" style={{ display: 'inline-block', margin: '0 4px' }}>
                    <Img src="https://img.icons8.com/ios-filled/50/ea6c9a/facebook-new.png" width="16" height="16" alt="Facebook" />
                  </a>
                </div>
              </Column>
              <Column width="33.33%" style={styles.footerCol} className="footer-col" align="center" valign="top">
                <Text style={styles.footerTitle} className="footer-title">🛡 100% SECURE</Text>
                <Text style={styles.footerText} className="footer-text">Safe payments.<br/>Shop with confidence.</Text>
              </Column>
            </Row>
            <center>
              <Text style={styles.copyright}>© 2026 Sterling Kart. All rights reserved.</Text>
            </center>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { backgroundColor: '#050505', fontFamily: 'Helvetica, Arial, sans-serif', padding: '20px 0' },
  container: { margin: '0 auto', backgroundColor: '#0F1014', width: '600px', maxWidth: '100%', color: '#ffffff' },
  heroSection: { 
    textAlign: 'center', 
    backgroundColor: '#1a1014',
    backgroundImage: 'url("https://raw.githubusercontent.com/maximanoob01/sterling-cart-main-/main/src/assets/images/c5.jpeg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '60px 20px',
  },
  heroOverlay: { 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: '20px', 
    borderRadius: '8px',
    display: 'inline-block'
  },
  heroTitle: { color: '#ea6c9a', fontSize: '36px', letterSpacing: '4px', margin: '0', fontWeight: 'normal', fontFamily: 'Georgia, serif' },
  heroSubtitle: { color: '#ffffff', fontSize: '10px', letterSpacing: '3px', margin: '10px 0 0 0', opacity: 0.8 },
  welcomeSection: { padding: '40px 30px' },
  welcomeScript: { color: '#ea6c9a', fontSize: '24px', fontStyle: 'italic', margin: '0', fontFamily: 'Georgia, serif' },
  greeting: { color: '#ffffff', fontSize: '42px', margin: '10px 0 20px 0', fontFamily: 'Georgia, serif', fontWeight: 'normal' },
  text: { color: '#b0b0b0', fontSize: '15px', lineHeight: '1.6', margin: '0' },
  loyaltyBox: { margin: '0 30px 40px 30px', border: '1px solid #ea6c9a', borderRadius: '12px', padding: '30px', backgroundColor: 'rgba(234, 108, 154, 0.05)' },
  loyaltyLeft: { width: '80px', textAlign: 'center', verticalAlign: 'middle' },
  loyaltyRight: { verticalAlign: 'middle' },
  loyaltyTitle: { color: '#ea6c9a', fontSize: '12px', letterSpacing: '2px', margin: '0' },
  loyaltyAmount: { color: '#ea6c9a', fontSize: '48px', margin: '5px 0', lineHeight: '1' },
  loyaltySubtitle: { color: '#ffffff', fontSize: '14px', letterSpacing: '1px', fontWeight: 'bold', margin: '0 0 10px 0' },
  loyaltyDesc: { color: '#a0a0a0', fontSize: '13px', margin: '0' },
  sectionDivider: { textAlign: 'center', margin: '20px 0 20px 0' },
  dividerText: { color: '#ea6c9a', fontSize: '14px', letterSpacing: '2px', margin: '0' },
  bestsellers: { padding: '0 10px' },
  productCard: { backgroundColor: '#16181d', borderRadius: '8px', padding: '8px', textAlign: 'center', margin: '0 4px', border: '1px solid #222' },
  productImg: { borderRadius: '6px', marginBottom: '10px' },
  productName: { color: '#ffffff', fontSize: '11px', margin: '0 0 5px 0', minHeight: '26px' },
  productPrice: { color: '#a0a0a0', fontSize: '11px', margin: '0 0 10px 0' },
  shopBtn: { border: '1px solid #ea6c9a', color: '#ea6c9a', padding: '6px 12px', borderRadius: '20px', fontSize: '10px', textDecoration: 'none', display: 'inline-block' },
  perksBox: { padding: '0 10px' },
  perkCol: { textAlign: 'center', padding: '5px' },
  perkTitle: { color: '#ffffff', fontSize: '9px', letterSpacing: '1px', fontWeight: 'bold', margin: '10px 0 5px 0' },
  perkDesc: { color: '#888', fontSize: '9px', margin: '0', lineHeight: '1.4' },
  ctaSection: { textAlign: 'center', padding: '40px 30px' },
  mainBtn: { background: 'linear-gradient(90deg, #ea6c9a 0%, #ff4b72 100%)', color: '#ffffff', padding: '15px 40px', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', marginBottom: '30px' },
  thankYou: { color: '#a0a0a0', fontSize: '14px', margin: '0 0 10px 0' },
  journey: { color: '#ea6c9a', fontSize: '20px', fontStyle: 'italic', fontFamily: 'Georgia, serif', margin: '0' },
  footer: { backgroundColor: '#0a0a0d', borderTop: '1px solid #222', padding: '30px 10px' },
  footerCol: { textAlign: 'center', verticalAlign: 'top', padding: '0 5px' },
  footerTitle: { color: '#ea6c9a', fontSize: '11px', letterSpacing: '1px', margin: '0 0 10px 0' },
  footerText: { color: '#888', fontSize: '11px', lineHeight: '1.5', margin: '0' },
  copyright: { color: '#555', fontSize: '10px', textAlign: 'center', marginTop: '30px' },
};
