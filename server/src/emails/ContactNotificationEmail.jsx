import React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Hr } from '@react-email/components';

export default function ContactNotificationEmail({ contactData }) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading style={styles.title}>New Contact Form Submission</Heading>
          </Section>

          <Section style={styles.content}>
            <Text style={styles.field}>
              <strong>Name:</strong> {contactData.name}
            </Text>
            <Text style={styles.field}>
              <strong>Email:</strong> {contactData.email}
            </Text>
            <Text style={styles.field}>
              <strong>Phone:</strong> {contactData.phone || 'N/A'}
            </Text>
            <Text style={styles.field}>
              <strong>Order ID:</strong> {contactData.orderId || 'N/A'}
            </Text>

            <Hr style={styles.hr} />

            <Text style={styles.fieldTitle}><strong>Message:</strong></Text>
            <Section style={styles.messageBox}>
              <Text style={styles.messageText}>{contactData.message}</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f5f5f5',
    fontFamily: 'Inter, Arial, sans-serif',
    padding: '20px',
  },
  container: {
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    maxWidth: '600px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
  },
  header: {
    backgroundColor: '#071529',
    padding: '20px',
  },
  title: {
    color: '#ffffff',
    fontSize: '18px',
    margin: '0',
  },
  content: {
    padding: '30px',
  },
  field: {
    fontSize: '14px',
    color: '#333333',
    margin: '0 0 10px 0',
  },
  hr: {
    borderColor: '#eeeeee',
    margin: '20px 0',
  },
  fieldTitle: {
    fontSize: '14px',
    color: '#333333',
    margin: '0 0 10px 0',
  },
  messageBox: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #eeeeee',
  },
  messageText: {
    fontSize: '14px',
    color: '#555555',
    lineHeight: '1.6',
    margin: '0',
    whiteSpace: 'pre-wrap',
  },
};
