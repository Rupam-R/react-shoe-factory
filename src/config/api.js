// Central API base configuration for frontend requests
// Set VITE_API_BASE in your .env (local) and Netlify environment variables (production)
// Example: VITE_API_BASE=https://your-backend.example.com
export const API_BASE = import.meta.env.VITE_API_BASE || '';

