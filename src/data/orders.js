export const mockOrders = [];

export const mockCustomers = [];

export const mockReviews = [
  { id: 1, productId: 1, name: 'Priya S.', date: '2025-05-15', rating: 5, text: 'Absolutely love this ring! The silver quality is amazing and it fits perfectly. Wore it to work and got so many compliments.', verified: true },
  { id: 2, productId: 1, name: 'Anita M.', date: '2025-05-10', rating: 4, text: 'Beautiful ring with a great shine. Packaging was premium and delivery was quick. Only wish it was slightly thicker.', verified: true },
  { id: 3, productId: 1, name: 'Kavita R.', date: '2025-04-28', rating: 5, text: 'This is my third purchase from Sterling Kart and they never disappoint. The ring is elegant and well-crafted.', verified: true },
  { id: 4, productId: 5, name: 'Deepa N.', date: '2025-05-20', rating: 5, text: 'These studs are stunning! Perfect everyday sparkle without being too flashy. The CZ stones look real.', verified: true },
  { id: 5, productId: 5, name: 'Sanya K.', date: '2025-05-18', rating: 4, text: 'Good quality studs. The push-back closure is secure. Only giving 4 stars because they are slightly smaller than expected.', verified: true },
  { id: 6, productId: 10, name: 'Meera I.', date: '2025-05-22', rating: 5, text: 'The layered necklace is a dream! It looks so much more expensive than it is. Perfect for both Indian and Western outfits.', verified: true },
  { id: 7, productId: 6, name: 'Ritu A.', date: '2025-05-12', rating: 5, text: 'These jhumkas are a masterpiece! The craftsmanship is incredible. Wore them to my cousin\'s wedding and everyone asked where I got them.', verified: true },
  { id: 8, productId: 14, name: 'Ishita G.', date: '2025-05-08', rating: 4, text: 'Cute charm bracelet with good weight to it. The charms are well-made and don\'t feel cheap at all.', verified: false },
  { id: 9, productId: 15, name: 'Kavita R.', date: '2025-05-25', rating: 5, text: 'This tennis bracelet is absolutely gorgeous! I get compliments every time I wear it. The CZ stones sparkle like real diamonds.', verified: true },
  { id: 10, productId: 23, name: 'Ritu A.', date: '2025-05-28', rating: 5, text: 'Bought this for my wedding and I couldn\'t be happier. Every piece in the set is beautifully crafted. Thank you Sterling Kart!', verified: true },
  { id: 11, productId: 27, name: 'Deepa N.', date: '2025-05-30', rating: 4, text: 'Sweet heart pendant. Simple yet elegant. Would have loved if it came with a chain included.', verified: true },
  { id: 12, productId: 3, name: 'Sanya K.', date: '2025-05-14', rating: 5, text: 'The moonstone in this ring is mesmerizing! The way it catches light is truly magical. Best jewellery purchase I\'ve ever made.', verified: true },
];

export const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    city: 'Bangalore',
    rating: 5,
    text: 'Sterling Kart has completely changed how I shop for silver jewellery. The quality is exceptional and every piece feels so premium. I\'m a customer for life!',
    avatar: 'PS',
  },
  {
    id: 2,
    name: 'Ananya Patel',
    city: 'Mumbai',
    rating: 5,
    text: 'I ordered a layered necklace and it exceeded all my expectations. The packaging was beautiful and delivery was super fast. Highly recommend!',
    avatar: 'AP',
  },
  {
    id: 3,
    name: 'Meera Iyer',
    city: 'Chennai',
    rating: 4,
    text: 'Beautiful traditional jhumkas that I wore to my sister\'s wedding. Everyone asked about them! Great craftsmanship and attention to detail.',
    avatar: 'MI',
  },
  {
    id: 4,
    name: 'Ritu Agarwal',
    city: 'Delhi',
    rating: 5,
    text: 'The bridal set I purchased was absolutely stunning. Each piece was carefully crafted and the CZ stones sparkle beautifully. Made my special day even more special.',
    avatar: 'RA',
  },
];

export const adminStats = {
  totalOrders: 156,
  revenueToday: 24890,
  pendingOrders: 12,
  totalProducts: 42,
  totalCustomers: 89,
  totalRevenue: 487650,
};

export const revenueData = [
  { date: 'May 1', revenue: 12500 },
  { date: 'May 2', revenue: 8900 },
  { date: 'May 3', revenue: 15600 },
  { date: 'May 4', revenue: 11200 },
  { date: 'May 5', revenue: 19800 },
  { date: 'May 6', revenue: 14300 },
  { date: 'May 7', revenue: 22100 },
  { date: 'May 8', revenue: 9800 },
  { date: 'May 9', revenue: 16700 },
  { date: 'May 10', revenue: 13400 },
  { date: 'May 11', revenue: 21500 },
  { date: 'May 12', revenue: 18200 },
  { date: 'May 13', revenue: 25600 },
  { date: 'May 14', revenue: 11900 },
  { date: 'May 15', revenue: 14800 },
  { date: 'May 16', revenue: 20100 },
  { date: 'May 17', revenue: 17600 },
  { date: 'May 18', revenue: 23400 },
  { date: 'May 19', revenue: 15900 },
  { date: 'May 20', revenue: 28700 },
  { date: 'May 21', revenue: 19200 },
  { date: 'May 22', revenue: 16100 },
  { date: 'May 23', revenue: 21800 },
  { date: 'May 24', revenue: 24500 },
  { date: 'May 25', revenue: 18900 },
  { date: 'May 26', revenue: 27300 },
  { date: 'May 27', revenue: 15400 },
  { date: 'May 28', revenue: 22600 },
  { date: 'May 29', revenue: 19700 },
  { date: 'May 30', revenue: 31200 },
  { date: 'May 31', revenue: 24890 },
];

export const coupons = {
  'WELCOME10': { discount: 10, type: 'percentage', description: '10% off on first order', minOrder: 500 },
  'FESTIVE10': { discount: 10, type: 'percentage', description: '10% off festive collection', minOrder: 1000 },
  'BRIDE10': { discount: 10, type: 'percentage', description: '10% off bridal sets', minOrder: 3000 },
  'FLAT200': { discount: 200, type: 'flat', description: '₹200 off on orders above ₹2000', minOrder: 2000 },
  'SILVER15': { discount: 15, type: 'percentage', description: '15% off on silver chains', minOrder: 1000 },
};
