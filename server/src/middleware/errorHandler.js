import { ValidationError, UniqueConstraintError, DatabaseError } from 'sequelize';

const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError' || err instanceof ValidationError) {
    const messages = err.errors.map(e => e.message);
    console.error('❌ Validation Error Details:', messages);
    return res.status(400).json({ success: false, error: 'Validation Error', details: messages });
  }

  // Sequelize unique constraint
  if (err instanceof UniqueConstraintError) {
    const fields = Object.keys(err.fields || {}).join(', ');
    return res.status(409).json({ success: false, error: `Duplicate value for: ${fields}` });
  }
  
  // Generic DB Error (like invalid UUID format)
  if (err instanceof DatabaseError) {
    return res.status(400).json({ success: false, error: 'Database Error' });
  }

  // Firebase auth error
  if (err.code?.startsWith('auth/')) {
    return res.status(401).json({ success: false, error: err.message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
