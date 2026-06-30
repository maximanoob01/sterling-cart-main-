import { getAuth } from '../config/firebase.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.user = decoded;

    // Load DB user if exists (using Sequelize)
    const { User } = await import('../models/index.js');
    let dbUser = await User.findOne({ where: { firebaseUid: decoded.uid } });

    // Auto-create user on first verified login
    if (!dbUser) {
      dbUser = await User.create({
        firebaseUid: decoded.uid,
        phone: decoded.phone_number || '',
        name: decoded.name || '',
        email: decoded.email || '',
        role: 'user',
      });
    }

    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await getAuth().verifyIdToken(token);
    req.user = decoded;

    const { User } = await import('../models/index.js');
    req.dbUser = await User.findOne({ where: { firebaseUid: decoded.uid } });
  } catch {
    // Token invalid — just continue without auth
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.dbUser || req.dbUser.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};
