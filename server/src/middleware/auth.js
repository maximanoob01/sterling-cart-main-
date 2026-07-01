import jwt from 'jsonwebtoken';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-dev');
    req.user = decoded;

    // Load DB user if exists (using Sequelize)
    const { User } = await import('../models/index.js');
    const dbUser = await User.findByPk(decoded.userId);

    if (!dbUser) {
      return res.status(401).json({ success: false, error: 'User not found' });
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-dev');
    req.user = decoded;

    const { User } = await import('../models/index.js');
    req.dbUser = await User.findByPk(decoded.userId);
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
