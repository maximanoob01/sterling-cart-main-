export const shareGiftCardToWhatsApp = async (amount, code, expiryDate) => {
  // The link must be included so WhatsApp fetches the OG tags and generates the gift card preview
  const text = `Here's your Sterling Kart gift card worth ₹${amount}!\nCode: ${code}\nValid till: ${expiryDate}\n\nShop now at https://sterlingkart.in`;
  
  try {
    // We no longer pass 'files' to navigator.share, as WhatsApp natively separates files and text.
    // By passing only text with a URL, WhatsApp generates a beautiful rich link preview using the OG image.
    if (navigator.canShare && navigator.canShare({ text: text })) {
      await navigator.share({
        text: text
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  } catch (error) {
    console.error('Error sharing to WhatsApp:', error);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }
};
