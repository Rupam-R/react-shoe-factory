# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Netlify Deployment

This project is configured for easy deployment to Netlify as a static React app built with Vite.

### What I configured

- `vite.config.js`: set `base: '/'` so built asset URLs work at the site root on Netlify.
- `netlify.toml`: added the build command and publish directory, plus SPA fallback.
- `public/_redirects`: ensures React Router works on refresh and deep links.
- `.env.example`: documents `VITE_API_BASE` to point the frontend to your backend API.

### One-time setup on Netlify

1. Push the repo to GitHub/GitLab/Bitbucket.
2. In Netlify, "Add new site" → "Import from Git" and select this repository.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variable (Site settings → Environment variables):
   - `VITE_API_BASE` = your backend base URL, for example `https://your-backend.example.com`
5. Deploy the site.

### Backend considerations

This repository includes an Express backend at `backend/server.js` which connects to MySQL and serves API routes under `/api/*`. Netlify hosts static frontends; to use this backend in production you have two options:

- Deploy the Express server separately (e.g., Render, Railway, VPS) and set `VITE_API_BASE` to that URL. Make sure your backend CORS allows your Netlify domain and `credentials: true` if you rely on cookies.
- Or migrate the API to Netlify Functions and a serverless-friendly database driver. This requires code changes and is not part of the default setup.

### Local development

1. Install dependencies: `npm install`
2. Start the frontend dev server: `npm run dev`
3. If using the local backend, start it separately (ensure CORS allows `http://localhost:5173`).
4. Create a `.env` file based on `.env.example`:
   - For local API: `VITE_API_BASE=http://localhost:5000`
   - For production API: `VITE_API_BASE=https://your-backend.example.com`

