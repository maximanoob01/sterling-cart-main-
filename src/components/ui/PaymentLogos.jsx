import React from 'react';
import shiprocketImg from '../../assets/images/ship.png';

export const VisaLogo = () => (
  <div className="w-[38px] h-[24px] rounded-[3px] bg-white border border-[#E8DDD5] flex items-center justify-center overflow-hidden text-[#1434CB]">
    <svg viewBox="0 0 32 32" className="w-[85%] h-[85%]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.984 21.037l2.006-12.72h3.242l-2.008 12.72h-3.24zm14.184-12.441c-0.603-0.28-1.599-0.589-2.883-0.589-3.187 0-5.436 1.706-5.454 4.148-0.024 1.782 1.624 2.775 2.859 3.385 1.272 0.627 1.696 1.032 1.694 1.593-0.003 0.859-1.028 1.258-1.979 1.258-1.328 0-2.031-0.201-3.118-0.686l-0.44-0.206-0.457 2.85c0.776 0.358 2.203 0.669 3.693 0.686 3.384 0 5.603-1.67 5.626-4.256 0.013-1.408-0.841-2.483-2.738-3.39-1.135-0.59-1.83-0.984-1.833-1.583 0-0.548 0.624-1.127 1.884-1.127 1.054-0.021 1.82 0.222 2.404 0.493l0.292 0.137 0.451-2.712zm-18.066 12.441l-2.527-11.973c-0.344-1.385-1.472-1.786-2.585-1.956l-3.328-0.395 0.046 0.219c0.71 0.15 1.517 0.428 2.025 0.672 0.776 0.373 0.986 0.677 1.185 1.455l2.008 11.979h3.424l5.35-12.72h-3.411l-2.186 12.72h-0.001z"/>
    </svg>
  </div>
);

export const MastercardLogo = () => (
  <div className="w-[38px] h-[24px] rounded-[3px] bg-white border border-[#E8DDD5] flex items-center justify-center overflow-hidden">
    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="max-w-[80%] max-h-[80%] object-contain" />
  </div>
);

export const AmexLogo = () => (
  <div className="w-[38px] h-[24px] rounded-[3px] bg-white border border-[#E8DDD5] flex items-center justify-center overflow-hidden bg-[#006FCF]">
    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="w-full h-full object-contain" />
  </div>
);

export const RazorpayLogo = () => (
  <div className="w-[54px] h-[24px] rounded-[3px] bg-white border border-[#E8DDD5] flex items-center justify-center overflow-hidden">
    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="max-w-[85%] max-h-[85%] object-contain" />
  </div>
);

export const ShiprocketLogo = () => (
  <div className="w-[54px] h-[24px] rounded-[3px] bg-white border border-[#E8DDD5] flex items-center justify-center overflow-hidden">
    <img src={shiprocketImg} alt="Shiprocket" className="w-full h-full object-cover" />
  </div>
);

export const GPayLogo = () => (
  <svg viewBox="0 0 38 24" className="w-8 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#fff" stroke="#E8DDD5" />
    <path d="M12 16v-8h3v1.2c.6-1 1.7-1.5 2.9-1.5 1.5 0 2.7.5 3.6 1.4.9 1 1.3 2.2 1.3 3.8v4.1h-3v-3.7c0-.9-.2-1.5-.5-1.9-.4-.4-1-.5-1.7-.5-1 0-1.8.4-2.2 1.1-.5.7-.7 1.5-.7 2.5v2.5H12zM25.5 16.2c-1.3 0-2.3-.4-3-1.1-.7-.8-1.1-1.7-1.1-2.9 0-1.2.4-2.1 1.2-2.8.8-.7 1.9-1.1 3.2-1.1s2.3.3 3 1c.7.6 1.1 1.5 1.1 2.6v.6H24c.1.9.4 1.5.8 1.9.5.4 1 .6 1.7.6.8 0 1.5-.3 2.1-.8l1.6 1.6c-.4.5-1 1-1.7 1.3-.7.3-1.6.5-2.5.5zm1.3-4.9c0-.6-.2-1.1-.5-1.4-.3-.4-.8-.5-1.3-.5-.6 0-1.1.2-1.4.6-.4.4-.6 1-.7 1.6h4c0-.1-.1-.2-.1-.3z" fill="#5F6368" />
    <path d="M7.7 16H4.3l4-9.2h3.4l-1.3 3.1h.1c.5-1 1.5-1.6 2.7-1.6h.4v3.1h-.5c-1.2 0-2.2.5-2.8 1.4-.6 1-.9 2-.9 3.2V16z" fill="#1A73E8" />
  </svg>
);

export const PhonePeLogo = () => (
  <svg viewBox="0 0 38 24" className="w-8 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#5f259f" />
    <path d="M19.4 16.5l1.6-4.2h-2c-1.3 0-2.2-.4-2.8-1.2-.5-.8-.8-1.9-.8-3.4 0-1.6.3-2.8.9-3.5.6-.8 1.5-1.1 2.8-1.1h3.9v3h-3.4c-.6 0-1 .2-1.2.5-.2.4-.3 1-.3 1.8 0 .8.1 1.4.4 1.7.3.3.7.5 1.2.5h3.6l-1.9 4.9h-2zm6.2 0v-4.2h-1.6V9.4h1.6v-1c0-1.1.3-1.9.9-2.5.6-.6 1.5-.9 2.7-.9.8 0 1.6.1 2.3.4v2.7c-.5-.2-1-.3-1.4-.3-.5 0-.9.1-1.1.4-.2.2-.3.6-.3 1v.3h2.6v2.9h-2.6v4.2h-3.1z" fill="#fff" />
  </svg>
);

export const PaytmLogo = () => (
  <svg viewBox="0 0 38 24" className="w-8 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#fff" stroke="#E8DDD5" />
    <path d="M6 16.5V7.5h2.5c1.4 0 2.4.3 3.1.9.7.6 1.1 1.6 1.1 2.8 0 1.2-.4 2.1-1.1 2.8-.7.6-1.7 1-3.1 1h-1v1.5H6zm1.5-2.8h1c.9 0 1.6-.2 2.1-.6.5-.4.7-1.1.7-1.9s-.2-1.4-.7-1.9c-.5-.4-1.2-.6-2.1-.6h-1v5z" fill="#002970" />
    <path d="M14 16.5v-1c-.5.8-1.4 1.2-2.5 1.2-1.1 0-2-.4-2.6-1.1-.6-.7-.9-1.6-.9-2.7 0-1.2.3-2.1.9-2.8.6-.7 1.5-1.1 2.6-1.1 1 0 1.8.4 2.3 1.1h.1v-1h1.5v7.4H14zm-.8-2c.6-.4.9-1 .9-1.8 0-.8-.3-1.4-.9-1.8-.5-.4-1.2-.6-1.9-.6s-1.4.2-1.9.6c-.6.4-.9 1-.9 1.8 0 .7.3 1.3.9 1.8.5.4 1.2.6 1.9.6.8.1 1.4-.1 1.9-.6zm9.3-5.4l-2.6 7.4h-1.6l-2.6-7.4h1.7l1.7 5.2h.1l1.6-5.2h1.7z" fill="#00baf2" />
  </svg>
);

export const RupayLogo = () => (
  <svg viewBox="0 0 38 24" className="w-8 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#fff" stroke="#E8DDD5" />
    <path d="M9.5 16.5h3.2v-3.8h2.3c1.4 0 2.4-.4 3-1.1.7-.8 1-1.8 1-3s-.3-2.2-1-3c-.6-.7-1.6-1.1-3-1.1H9.5v12zm3.2-6v-3.7h1.6c.7 0 1.2.2 1.5.5.3.4.5.9.5 1.5s-.2 1.2-.5 1.5c-.3.4-.8.5-1.5.5h-1.6v-.3z" fill="#F58220" />
    <path d="M18 16.5v-1.1c-.5.9-1.3 1.3-2.6 1.3-1.2 0-2.1-.4-2.8-1.1-.7-.7-1-1.7-1-3V8.8h3v3.7c0 .7.2 1.2.5 1.5.3.3.8.5 1.5.5.7 0 1.2-.2 1.5-.5.4-.3.5-.8.5-1.5V8.8h3v7.7H18z" fill="#00A450" />
  </svg>
);

export const AmazonPayLogo = () => (
  <svg viewBox="0 0 38 24" className="w-8 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#fff" stroke="#E8DDD5" />
    <path d="M11.5 11c0 2 1.5 3.5 3.5 3.5 1 0 2-.4 2.7-1.1l-1-1.2c-.5.5-1.1.8-1.7.8-1 0-1.8-.7-1.9-1.7h4.8c.1-.3.1-.6.1-1 0-2-1.3-3.4-3.4-3.4s-3.1 1.6-3.1 4.1zm1.7-.8c.1-.8.7-1.4 1.5-1.4s1.3.5 1.3 1.4h-2.8z" fill="#232F3E" />
    <path d="M19 14.5l-1-1.4v1.4H16V6h2v4.8l2.5-3.3h2.3l-2.8 3.5 3 3.5H21l-2-2.5z" fill="#232F3E" />
    <path d="M26.5 7h4v1.5h-4zM26.5 10.5h4V12h-4z" fill="#232F3E" />
    <path d="M18.8 17.5c-2.3 1-4.9 1.5-7.5 1.5C8 19 5.2 18.2 3 16.7L4.2 15c2 1.3 4.4 2 6.8 2 2.2 0 4.4-.4 6.4-1.2l1.4 1.7z" fill="#FF9900" />
  </svg>
);

export const MobikwikLogo = () => (
  <svg viewBox="0 0 38 24" className="w-8 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#003366" />
    <path d="M12.5 15h2l-2.4-3.5 2.2-3.2h-2.1L10.5 11 8.8 8.3H6.7l2.2 3.2L6.5 15h2l1.9-2.8 2.1 2.8zm6.5-6.7h-1.6V15h1.6V8.3zm6.5 6.7h1.6v-3l1.8-3.7h-1.7L26 11l-1.2-2.7h-1.8l1.8 3.7v3z" fill="#fff" />
  </svg>
);

export const BankLogo = () => (
  <svg viewBox="0 0 38 24" className="w-8 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#fff" stroke="#E8DDD5" />
    <path d="M19 6L9 11v1.5h20V11L19 6zm-7 8v5h2v-5h-2zm5 0v5h2v-5h-2zm5 0v5h2v-5h-2zM9 20h20v1.5H9V20z" fill="#666" />
  </svg>
);

export const CashLogo = () => (
  <svg viewBox="0 0 38 24" className="w-8 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#fff" stroke="#E8DDD5" />
    <rect x="8" y="7" width="22" height="10" rx="1" stroke="#4CAF50" strokeWidth="1.5" />
    <circle cx="19" cy="12" r="2.5" stroke="#4CAF50" strokeWidth="1.5" />
    <path d="M10 9v1M28 9v1M10 15v-1M28 15v-1" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
