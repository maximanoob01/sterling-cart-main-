import React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Hr } from '@react-email/components';

export default function CallConfirmationEmail({ name, preferredDate, finalTime, timeSlot }) {
  const displayDate = new Date(preferredDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const displayTime = finalTime || timeSlot;

  return (
    <Html>
      <Head />
      <Body style={s.body}>
        <Container style={s.container}>

          {/* Header */}
          <Section style={s.header}>
            <Heading style={s.brand}>STERLING KART</Heading>
            <Text style={s.headerSub}>Your call is confirmed ✓</Text>
          </Section>

          {/* Body */}
          <Section style={s.content}>
            <Text style={s.greeting}>Hi {name || 'there'},</Text>
            <Text style={s.para}>
              Great news! Your personalized consultation call with Sterling Kart has been confirmed.
              Our team will reach out to you at the time below — please keep your phone handy.
            </Text>

            {/* Time card */}
            <Section style={s.card}>
              <Text style={s.cardLabel}>📅 Date</Text>
              <Text style={s.cardValue}>{displayDate}</Text>
              <Hr style={s.divider} />
              <Text style={s.cardLabel}>🕐 Time</Text>
              <Text style={s.cardValue}>{displayTime}</Text>
            </Section>

            <Text style={s.para}>
              We're looking forward to helping you create something truly personal. If you have any
              design files or references you'd like to share in advance, feel free to WhatsApp us at{' '}
              <span style={s.accent}>+91 84452 05669</span>.
            </Text>

            <Text style={s.para}>
              If you need to reschedule or have any questions, just reply to this email or reach us
              on WhatsApp and we'll sort it out right away.
            </Text>

            <Text style={s.sign}>
              Warm regards,<br />
              <strong>Team Sterling Kart</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={s.footer}>
            <Text style={s.footerText}>
              Sterling Kart · Handcrafted 925 Sterling Silver Jewellery
            </Text>
            <Text style={s.footerText}>
              This is an automated message. Please do not reply directly to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const s = {
  body: {
    backgroundColor: '#F9F4F6',
    fontFamily: 'Inter, Arial, sans-serif',
    padding: '40px 20px',
  },
  container: {
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '580px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  header: {
    backgroundColor: '#1A1A1A',
    padding: '32px 24px',
    textAlign: 'center',
  },
  brand: {
    color: '#D4527A',
    fontSize: '22px',
    letterSpacing: '3px',
    margin: '0 0 6px 0',
    fontWeight: '800',
  },
  headerSub: {
    color: '#ffffff',
    margin: '0',
    fontSize: '15px',
    opacity: 0.85,
  },
  content: {
    padding: '36px 32px',
  },
  greeting: {
    color: '#1A1A1A',
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 16px 0',
  },
  para: {
    color: '#555555',
    fontSize: '15px',
    lineHeight: '1.7',
    margin: '0 0 18px 0',
  },
  card: {
    backgroundColor: '#FFF4F6',
    border: '1px solid #F1D8DE',
    borderRadius: '12px',
    padding: '20px 24px',
    margin: '24px 0',
  },
  cardLabel: {
    color: '#D4527A',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    margin: '0 0 4px 0',
  },
  cardValue: {
    color: '#1A1A1A',
    fontSize: '17px',
    fontWeight: '700',
    margin: '0',
  },
  divider: {
    borderColor: '#F1D8DE',
    margin: '14px 0',
  },
  accent: {
    color: '#D4527A',
    fontWeight: '600',
  },
  sign: {
    color: '#1A1A1A',
    fontSize: '15px',
    lineHeight: '1.6',
    margin: '24px 0 0 0',
  },
  footer: {
    backgroundColor: '#F5F5F5',
    padding: '20px 32px',
    textAlign: 'center',
  },
  footerText: {
    color: '#999999',
    fontSize: '12px',
    margin: '0 0 4px 0',
    lineHeight: '1.5',
  },
};
