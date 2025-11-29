import jwt from 'jsonwebtoken';

export function protect(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attaches user info (id, role) to the request
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Not authorized, token failed.' });
  }
}

// Optional: For restricting routes to specific roles
export const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.map(r => r.toUpperCase()).includes(req.user.role?.toUpperCase())) {
    return res.status(403).json({ error: 'You do not have permission to perform this action.' });
  }
  next();
};