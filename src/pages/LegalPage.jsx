import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ShieldCheck, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const termsData = [
  {
    title: "1. Acceptance of Terms",
    content: "Your access to and use of the Website constitutes your full acceptance of these Terms. This agreement is legally binding under the Indian Contract Act, 1872, and the Information Technology Act, 2000 (as amended). These Terms apply to all users of the Website including guests, registered customers, and visitors.\n\nWe reserve the right to update or modify these Terms at any time. Changes take effect immediately upon posting on this page with a revised \"Last Updated\" date. Your continued use of the Website after any modification constitutes your acceptance of the updated Terms."
  },
  {
    title: "2. Eligibility",
    content: "By using this Website, you represent and warrant that:\n• You are at least 18 years of age, or you are accessing the Website under the supervision of a parent or legal guardian who agrees to be bound by these Terms.\n• You have the legal capacity to enter into a binding contract under Indian law.\n• You are not barred from using this Website under any applicable laws.\n• You are accessing the Website from a jurisdiction where use of this Website is lawful.\n\nIf you are accessing the Website on behalf of a business or organization, you represent that you have the authority to bind that entity to these Terms."
  },
  {
    title: "3. Account Registration",
    content: "Certain features on the Website, including order history, saved addresses, and wish lists, may require you to create an account.\n\nWhen registering, you agree to:\n• Provide accurate, current, and complete information.\n• Keep your account credentials confidential and not share them with any third party.\n• Notify us immediately if you suspect unauthorized access to your account.\n• Accept responsibility for all activities that occur under your account.\n\nWe reserve the right to suspend or permanently terminate accounts that contain false information, have been compromised, or are in violation of these Terms."
  },
  {
    title: "4. Products and Product Descriptions",
    content: "Sterling Kart sells 925 sterling silver jewellery and related accessories through this Website. All products are crafted from genuine 92.5% pure silver unless otherwise specified on the product page.\n\nPlease note the following about our product listings:\n• We make every effort to display product images accurately. However, actual colours and finishes may vary slightly from what you see on screen due to differences in monitor settings, lighting, and display calibration.\n• Each piece of jewellery is handcrafted or semi-handcrafted. Minor variations in finish, tone, texture, or weight are natural and do not constitute defects.\n• Product descriptions, weights, and dimensions are provided in good faith and are as accurate as reasonably possible.\n• All product pricing is in Indian Rupees (INR) and is inclusive of applicable GST unless stated otherwise.\n• Product availability is subject to stock and may change without prior notice. If an item you ordered becomes unavailable, we will inform you and either offer an alternative or issue a full refund."
  },
  {
    title: "5. Pricing and Payment",
    content: "All prices listed on the Website are in Indian Rupees (INR) and are subject to change without notice. Prices are confirmed at the time your order is placed and payment is processed.\n\nWe accept the following payment methods:\n• Credit and debit cards (Visa, Mastercard, RuPay)\n• Net banking\n• UPI (Unified Payments Interface)\n• Digital wallets (as available)\n\nAll payment transactions are processed through secure third-party payment gateways. Sterling Kart does not store, access, or retain your full card or banking details on our servers. You are responsible for ensuring that your payment details are accurate.\n\nAn order is considered confirmed only after successful payment processing and you receive an order confirmation email from us. We reserve the right to cancel or refuse any order at our discretion, including cases of suspected fraud, pricing errors, or stock unavailability."
  },
  {
    title: "6. Order Placement and Cancellation",
    content: "By placing an order on the Website, you make an offer to purchase the selected product(s). We reserve the right to accept or decline that offer.\n\nOrder confirmation is communicated via email after successful payment. Cancellations made before the order is dispatched may be accepted at our discretion. Once an order has been dispatched, cancellations will not be accepted and must be handled as per our Return & Exchange Policy (available on a separate page).\n\nSterling Kart reserves the right to cancel any order in the event of:\n• Pricing errors due to technical issues\n• Payment failure or suspected fraudulent activity\n• Unavailability of ordered product(s)\n• Inability to deliver to the specified address\n\nIn such cases, we will inform you promptly and issue a full refund where applicable."
  },
  {
    title: "7. Shipping and Delivery",
    content: "We ship across India and to select international destinations. Estimated delivery timelines are communicated at the time of checkout and in your order confirmation. These are estimates only and are not guaranteed.\n\nDelivery timelines may be affected by:\n• Courier partner delays\n• Strikes, natural calamities, or public holidays\n• Remote or non-serviceable pin codes\n• Incorrect or incomplete address information provided by you\n\nOnce your order is dispatched, you will receive a tracking number. Sterling Kart is not liable for delays caused by third-party courier partners after the order has been handed over for delivery.\n\nYou are responsible for providing a complete and accurate delivery address. We are not liable for non-delivery due to address errors made by the customer."
  },
  {
    title: "8. Intellectual Property Rights",
    content: "All content on this Website — including but not limited to product photographs, jewellery designs, written descriptions, logos, graphics, videos, and the overall look and feel of the Website — is the exclusive property of Sterling Kart and is protected under:\n• The Copyright Act, 1957\n• The Trade Marks Act, 1999\n• The Designs Act, 2000\n• The Information Technology Act, 2000\n\nYou are expressly prohibited from:\n• Copying, reproducing, distributing, or republishing any content from this Website without prior written permission.\n• Using our product images, brand name, logo, or jewellery designs for commercial purposes.\n• Reverse-engineering or scraping any part of the Website.\n• Creating derivative works based on our content or designs.\n\nAny unauthorized use of our intellectual property may result in civil and/or criminal legal action under applicable Indian laws."
  },
  {
    title: "9. Prohibited Use of the Website",
    content: "By using this Website, you agree NOT to:\n• Use the Website for any unlawful, fraudulent, or harmful purpose.\n• Impersonate any person or entity or misrepresent your affiliation with any person or entity.\n• Attempt to gain unauthorized access to any part of the Website, its servers, or any related databases.\n• Transmit any malware, viruses, or other harmful code via the Website.\n• Use automated bots, scrapers, or crawlers to extract data from the Website.\n• Interfere with or disrupt the normal operation of the Website or its associated infrastructure.\n• Post or transmit any content that is defamatory, obscene, harassing, offensive, or violates any applicable law.\n• Engage in price manipulation, fake reviews, or any other form of deceptive conduct.\n\nViolation of any of the above may result in immediate suspension of your account and may be reported to relevant authorities."
  },
  {
    title: "10. User-Generated Content",
    content: "If you submit reviews, ratings, comments, or other content on the Website, you grant Sterling Kart a non-exclusive, royalty-free, perpetual, worldwide license to use, display, reproduce, and distribute that content for business purposes, including marketing.\n\nYou represent that any content you submit is your own, does not infringe any third-party rights, and does not contain false, harmful, or misleading information. We reserve the right to remove any user-submitted content at our sole discretion without notice."
  },
  {
    title: "11. Third-Party Links",
    content: "The Website may contain links to third-party websites, payment gateways, or social media platforms. These links are provided for your convenience only. Sterling Kart does not endorse, control, or take responsibility for the content, privacy practices, or operations of any third-party website.\n\nAccessing third-party links is at your own risk, and you should review their respective terms and privacy policies before engaging with them."
  },
  {
    title: "12. Limitation of Liability",
    content: "To the fullest extent permitted under applicable Indian law, Sterling Kart shall not be liable for:\n• Indirect, incidental, consequential, or punitive damages arising from your use of the Website or products.\n• Any loss of data, profit, or goodwill resulting from use of or inability to use the Website.\n• Technical failures, errors, or interruptions beyond our reasonable control.\n• Damage caused by misuse, neglect, or improper care of jewellery products.\n\nOur maximum liability in any circumstance shall not exceed the amount paid by you for the specific order in dispute."
  },
  {
    title: "13. Disclaimer of Warranties",
    content: "This Website and its content are provided on an \"as is\" and \"as available\" basis. Sterling Kart makes no warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.\n\nWe do not warrant that the Website will be uninterrupted, error-free, or free of viruses or other harmful components. We make no guarantee that the Website will always be accessible or available without technical issues."
  },
  {
    title: "14. Governing Law and Dispute Resolution",
    content: "These Terms and any disputes arising from your use of the Website shall be governed by and construed in accordance with the laws of India, including but not limited to:\n• The Information Technology Act, 2000\n• The Consumer Protection Act, 2019\n• The Indian Contract Act, 1872\n\nAny disputes shall first be attempted to be resolved through mutual negotiation. If unresolved within 30 days, disputes shall be subject to the exclusive jurisdiction of the courts in Roorkee, Uttarakhand, India.\n\nFor consumer complaints, you may also approach the appropriate Consumer Dispute Redressal Forum under the Consumer Protection Act, 2019."
  },
  {
    title: "15. Grievance Officer",
    content: "In accordance with the Consumer Protection (E-Commerce) Rules, 2020, and the Information Technology Act, 2000, we have appointed a Grievance Officer to address your concerns:\n\nName: [Grievance Officer Name]\nEmail: support@sterlingkart.com\nPhone: +91-XXXXXXXXXX\nAddress: Sterling Kart, Roorkee, Uttarakhand, India\nWorking Hours: Monday to Saturday, 10:00 AM – 6:00 PM IST\n\nWe aim to acknowledge grievances within 48 hours and resolve them within 30 days of receipt."
  },
  {
    title: "16. Modification and Termination",
    content: "We reserve the right to modify, suspend, or terminate the Website or any of its features at any time without prior notice. We may also modify these Terms at any time, and continued use of the Website after changes are posted constitutes your acceptance of the revised Terms.\n\nWe may terminate or suspend your access to the Website immediately and without notice if we determine that you have violated these Terms."
  },
  {
    title: "17. Severability",
    content: "If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, that provision shall be severed, and the remaining provisions shall continue in full force and effect."
  },
  {
    title: "18. Entire Agreement",
    content: "These Terms, together with the Privacy Policy and any other policies published on the Website, constitute the entire agreement between you and Sterling Kart regarding your use of the Website and supersede all prior agreements and understandings."
  }
];

const privacyData = [
  {
    title: "1. Information We Collect",
    content: "We collect the following categories of information when you interact with us:\n\nPersonal Identification Information:\n• Full name\n• Email address\n• Mobile number\n• Billing and shipping address\n• Date of birth (optional, for birthday offers)\n\nOrder and Transaction Information:\n• Products purchased or browsed\n• Order value and payment method (not card details)\n• Delivery preferences and order history\n\nTechnical and Usage Data:\n• IP address and device type\n• Browser type and operating system\n• Pages visited and time spent on each page\n• Referring URL and click behaviour\n• Cookie identifiers and session data\n\nCommunication Data:\n• Messages sent via contact forms, email, or WhatsApp\n• Customer support queries and feedback\n• Product reviews or ratings submitted by you"
  },
  {
    title: "2. How We Use Your Information",
    content: "We use your personal information for the following purposes:\n• To process and fulfil your orders, including delivery and post-purchase support.\n• To send you order confirmations, shipping updates, and invoices.\n• To respond to your queries, complaints, or support requests.\n• To send you promotional offers, new arrivals, and sale announcements (only if you have opted in).\n• To improve our Website, product offerings, and customer experience.\n• To detect and prevent fraud, unauthorized access, and other security threats.\n• To comply with legal obligations under Indian law.\n• To conduct internal analytics and business reporting.\n\nWe do not use your personal information for any purpose not listed above without obtaining your separate consent."
  },
  {
    title: "3. Cookies and Tracking Technologies",
    content: "We use cookies and similar tracking technologies to enhance your browsing experience on our Website. Cookies are small text files stored on your device by your browser.\n\nTypes of cookies we use:\n• Essential Cookies: Required for the Website to function. These cannot be disabled without affecting core functionality such as the shopping cart and checkout.\n• Analytics Cookies: Help us understand how visitors interact with the Website (e.g., Google Analytics). These collect anonymized data.\n• Marketing Cookies: Used to track visits across websites for targeted advertising purposes. These are only active if you have given explicit consent.\n• Preference Cookies: Store your preferences such as currency, language, or recently viewed products.\n\nYou can manage or disable cookies through your browser settings at any time. Please note that disabling certain cookies may affect your experience on the Website."
  },
  {
    title: "4. How We Share Your Information",
    content: "We do not sell, rent, or trade your personal data. However, we may share your information with trusted third parties in the following circumstances:\n• Shipping Partners: We share your name and delivery address with courier and logistics partners to fulfil your order.\n• Payment Gateways: Your payment information is processed by secure third-party payment processors. We do not store your full card details.\n• Technology Providers: We use third-party tools for website hosting, analytics, and email communication. These vendors are bound by confidentiality obligations.\n• Legal Compliance: We may disclose your information if required to do so by law, government order, or court directive under the Information Technology Act, 2000 or any other applicable legislation.\n• Business Transfers: In the event of a merger, acquisition, or sale of our business, your data may be transferred to the successor entity, subject to the same privacy protections.\n\nAll third parties we work with are required to handle your data securely and use it only for the purposes for which it was shared."
  },
  {
    title: "5. Data Retention",
    content: "We retain your personal data only for as long as necessary to fulfil the purposes described in this Policy, unless a longer retention period is required by law.\n• Order data is retained for a minimum of 7 years for tax and accounting compliance under Indian law.\n• Account data is retained as long as your account remains active.\n• Marketing preferences and communication data are retained until you withdraw consent.\n\nWhen data is no longer required, we delete or anonymize it in a secure manner."
  },
  {
    title: "6. Data Security",
    content: "We take the security of your personal data seriously and implement appropriate technical and organizational measures to protect it, including:\n• SSL (Secure Socket Layer) encryption for all data transmission on the Website.\n• Secure servers and firewalls.\n• Restricted access to personal data, limited to authorized personnel only.\n• Regular security reviews and monitoring.\n\nHowever, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security. In the event of a data breach that affects your rights, we will notify you as required under applicable law."
  },
  {
    title: "7. Your Rights as a User",
    content: "Under applicable Indian data protection law and in line with principles of fair data use, you have the right to:\n• Access: Request a copy of the personal data we hold about you.\n• Correction: Request that inaccurate or incomplete data be corrected.\n• Deletion: Request deletion of your personal data, subject to legal retention requirements.\n• Withdrawal of Consent: Withdraw your consent to marketing communications at any time by clicking 'Unsubscribe' in any promotional email, or by contacting us directly.\n• Data Portability: Request your data in a portable format, where technically feasible.\n• Objection: Object to the processing of your data for marketing purposes.\n\nTo exercise any of these rights, please contact us at support@sterlingkart.com. We will respond within 30 days of receiving your request. We may ask you to verify your identity before acting on such requests."
  },
  {
    title: "8. Children's Privacy",
    content: "This Website is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal information, please contact us immediately and we will take steps to delete it promptly."
  },
  {
    title: "9. Marketing Communications",
    content: "With your consent, we may send you promotional emails, SMS messages, or WhatsApp notifications about new collections, offers, and events. You can opt out at any time by:\n• Clicking the 'Unsubscribe' link in any email we send.\n• Replying 'STOP' to any promotional SMS.\n• Contacting us at support@sterlingkart.com with the subject 'Unsubscribe'.\n\nPlease allow up to 7 business days for your opt-out request to take effect. Note that even after opting out of marketing communications, you will still receive transactional emails related to your orders."
  },
  {
    title: "10. Third-Party Links",
    content: "Our Website may contain links to third-party websites including social media platforms (Instagram, Facebook, Pinterest, etc.) and payment portals. This Privacy Policy applies solely to Sterling Kart's Website. We are not responsible for the privacy practices of third-party websites, and we encourage you to review their privacy policies independently before providing any personal information."
  },
  {
    title: "11. International Users",
    content: "This Website is operated from India and is intended primarily for customers within India. If you access the Website from outside India, you do so at your own initiative and are responsible for compliance with local laws. By using this Website, you consent to your data being processed in India and subject to Indian laws and regulations."
  },
  {
    title: "12. Changes to This Privacy Policy",
    content: "We may update this Privacy Policy periodically to reflect changes in our practices, legal requirements, or operational reasons. Any material changes will be communicated via a notice on the Website or by email to registered users. The revised policy will take effect upon posting with an updated \"Last Updated\" date.\n\nWe encourage you to review this Privacy Policy regularly to stay informed about how we are protecting your information."
  },
  {
    title: "13. Contact Us",
    content: "If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please contact us:\nEmail: support@sterlingkart.com\nPhone: +91 9911773307 | 7011028085\nAddress: Sterling Kart, Roorkee, Uttarakhand, India\nBusiness Hours: Monday to Saturday, 10:00 AM – 6:00 PM IST\n\nWe aim to respond to all privacy-related inquiries within 48 hours."
  }
];

const AccordionItem = ({ title, content, isOpen, onClick }) => {
  return (
    <div className="border border-border-main rounded-[16px] overflow-hidden mb-3 bg-white transition-all hover:border-[#D4527A]/30">
      <button
        onClick={onClick}
        className="w-full text-left px-5 py-4 flex items-center justify-between bg-white"
      >
        <span className="font-serif text-[16px] md:text-[18px] font-bold text-text-main pr-4">
          {title}
        </span>
        <ChevronDown 
          size={18} 
          className={`text-[#D4527A] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 pt-1 font-sans text-[14px] leading-[1.8] text-text-muted border-t border-[#F0E8EA] mt-1">
              {content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function LegalPage() {
  const [openTerm, setOpenTerm] = useState(null);
  const [openPrivacy, setOpenPrivacy] = useState(null);

  const toggleTerm = (index) => {
    setOpenTerm(openTerm === index ? null : index);
  };

  const togglePrivacy = (index) => {
    setOpenPrivacy(openPrivacy === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-20">
      <div className="max-w-[800px] mx-auto px-4 md:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-[#FFF0F5] text-[#D4527A] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-[36px] md:text-[42px] font-bold text-text-main mb-3">
            Legal Policies
          </h1>
          <p className="font-sans text-[15px] text-text-muted">
            Terms of Use & Privacy Policy
          </p>
          <div className="inline-flex mt-4 bg-white px-4 py-2 rounded-full border border-border-main text-[12px] font-semibold text-[#D4527A] uppercase tracking-[1px]">
            Effective Date: June 2026
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-16"
        >
          
          {/* Terms of Use Section */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-main">
              <FileText className="text-[#D4527A]" size={24} />
              <div>
                <h2 className="font-serif text-[28px] font-bold text-text-main">Terms of Use</h2>
                <p className="font-sans text-[12px] text-text-muted mt-1 uppercase tracking-[1px]">Last Updated: June 2026</p>
              </div>
            </div>
            
            <p className="font-sans text-[14px] leading-[1.8] text-text-muted mb-6 px-2">
              These Terms of Use ("Terms") govern your access to and use of the Sterling Kart website located at sterlingkart.com ("Website"), including browsing, account creation, placing orders, and any other interaction with our platform. By accessing or using this Website, you confirm that you have read, understood, and agreed to be bound by these Terms and all applicable laws and regulations.
              <br/><br/>
              <strong className="text-[#D4527A]">If you do not agree with any part of these Terms, please stop using this Website immediately.</strong>
            </p>

            <div className="space-y-3">
              {termsData.map((term, index) => (
                <AccordionItem
                  key={index}
                  title={term.title}
                  content={term.content}
                  isOpen={openTerm === index}
                  onClick={() => toggleTerm(index)}
                />
              ))}
            </div>
          </section>

          {/* Privacy Policy Section */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-main">
              <ShieldCheck className="text-[#D4527A]" size={24} />
              <div>
                <h2 className="font-serif text-[28px] font-bold text-text-main">Privacy Policy</h2>
                <p className="font-sans text-[12px] text-text-muted mt-1 uppercase tracking-[1px]">Last Updated: June 2026</p>
              </div>
            </div>
            
            <p className="font-sans text-[14px] leading-[1.8] text-text-muted mb-6 px-2">
              This Privacy Policy explains how Sterling Kart ("we", "us", "our") collects, stores, uses, and protects the personal information you provide when you visit sterlingkart.com or make a purchase from us. By using this Website, you consent to the practices described in this Privacy Policy.
              <br/><br/>
              This policy is drafted in compliance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023 (as applicable).
            </p>

            <div className="space-y-3">
              {privacyData.map((policy, index) => (
                <AccordionItem
                  key={index}
                  title={policy.title}
                  content={policy.content}
                  isOpen={openPrivacy === index}
                  onClick={() => togglePrivacy(index)}
                />
              ))}
            </div>
          </section>

          {/* Footer Area */}
          <div className="pt-10 border-t border-border-main text-center">
            <p className="font-sans text-[13px] text-text-muted mb-6">
              © 2026 Sterling Kart. All rights reserved. These policies are subject to change. Governed by the laws of India.
            </p>
            <Link to="/contact" className="btn-secondary inline-flex px-8">
              Contact Support
            </Link>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
