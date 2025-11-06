// supabase/functions/_shared/utils.ts

// Utility function for sending JSON responses
export const jsonResponse = (res: any, data: any, statusCode: number = 200) => {
  res.status(statusCode).json(data);
};

// Error handling utility
export const errorHandler = (res: any, message: string, statusCode: number = 500) => {
  res.status(statusCode).json({ error: message });
};

// CORS utility
export const cors = (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Change '*' to specific domains as needed
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Token extraction utility
export const extractToken = (req: any) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

// UUID generation utility
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Date formatting utility
export const formatDate = (date: Date, format: string) => {
  // Implement your date formatting logic here
};

// Pagination utility
export const paginate = (array: any[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  return array.slice(startIndex, endIndex);
};

// Slug creation utility
export const createSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

// Email validation utility
export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Request body parsing utility
export const parseBody = (req: any) => {
  return req.body; // Assumes body-parser middleware is used
};