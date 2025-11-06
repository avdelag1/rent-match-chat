import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import cors from 'cors';
import jwt from 'jsonwebtoken';

// Rate Limiting
const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 1, // per second
});

// CORS Options
const corsOptions = {
  origin: 'https://your-frontend-url.com', // Update this with your allowed origin
  optionsSuccessStatus: 200,
};

// Middleware for authentication
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  
  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Unauthorized!' });
    req.user = decoded; // Save decoded token to request object
    next();
  });
};

// Middleware for admin verification
export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Rate limiting middleware
export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({ message: 'Too many requests' });
    });
};

// CORS Middleware
export const corsMiddleware = cors(corsOptions);

// Request validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Add your request validation logic here
  // For example: checking the request body, parameters, etc.
  next();
};
