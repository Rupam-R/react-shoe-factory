import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Optional Firebase Admin initialization (for local/legacy server usage)
let firebaseInit = { initialized: false, error: null };
try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const databaseURL = process.env.DATABASE_URL;
  if (serviceAccountJson && databaseURL) {
    const creds = JSON.parse(serviceAccountJson);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(creds),
        databaseURL,
      });
    }
    firebaseInit.initialized = true;
    // Perform a light async connectivity check without blocking startup
    admin.database().ref('.info/connected').get()
      .then(() => {
        console.log('Firebase connected.');
      })
      .catch((e) => {
        firebaseInit.error = e?.message || String(e);
        console.error('Firebase connectivity error:', firebaseInit.error);
      });
  } else {
    console.error('Firebase not configured: set FIREBASE_SERVICE_ACCOUNT and DATABASE_URL env vars.');
  }
} catch (e) {
  firebaseInit.error = e?.message || String(e);
  console.error('Firebase initialization error:', firebaseInit.error);
}

// Middleware setup
// Allow local dev and an optional production origin from env (e.g., your Netlify site)
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:5173'];
const ENV_ALLOWED_ORIGIN = process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [];
const ALLOWED_ORIGINS = [...DEFAULT_ALLOWED_ORIGINS, ...ENV_ALLOWED_ORIGIN];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin like curl or mobile apps
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Also allow HTTPS variants of Netlify preview/production domains via pattern
    const netlifyPattern = /^https?:\/\/([a-z0-9-]+--)?.+netlify\.app$/i;
    if (netlifyPattern.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve static assets for uploaded images so frontend can load them via `${API_BASE}/<folder>/<file>`
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/product-img', express.static(path.join(__dirname, 'product-img')));
app.use('/banner-img', express.static(path.join(__dirname, 'banner-img')));
app.use('/service-img', express.static(path.join(__dirname, 'service-img')));
app.use('/category-img', express.static(path.join(__dirname, 'category-img')));
app.use('/deal-img', express.static(path.join(__dirname, 'deal-img')));
app.use('/weekdeal-img', express.static(path.join(__dirname, 'weekdeal-img')));

// Health endpoint to verify backend connectivity
app.get('/api/health', async (req, res) => {
  const status = { mysql: 'unknown', firebase: 'not_configured' };
  try {
    // MySQL status (best-effort)
    status.mysql = db && db.threadId ? 'connected' : 'unknown';
  } catch (_) {
    status.mysql = 'error';
  }

  if (firebaseInit.initialized) {
    try {
      await admin.database().ref('.info/connected').get();
      status.firebase = 'connected';
    } catch (e) {
      status.firebase = 'error';
      status.firebaseError = e?.message || String(e);
      console.error('Firebase connectivity error (health):', status.firebaseError);
    }
  } else {
    status.firebase = 'not_configured';
    status.firebaseError = firebaseInit.error || 'Missing FIREBASE_SERVICE_ACCOUNT or DATABASE_URL';
  }

  res.json(status);
});

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'shoe_factory'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

// ====================== USER PROFILE ENDPOINTS ====================== //

// Get user profile
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT id, username, email, phone, address, bio FROM users WHERE id = ?';
  
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result[0]);
  });
});

// Update user profile
app.put('/api/admin/manage-users/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const userId = req.params.id;
  const { username, email, phone, address, bio, is_admin } = req.body;

  const sql = `
    UPDATE users 
    SET username = ?, email = ?, phone = ?, address = ?, bio = ?, is_admin = ?
    WHERE id = ?
  `;

  db.query(sql, [username, email, phone, address, bio, is_admin, userId], (err, result) => {
    if (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch and return the updated user
    db.query('SELECT id, username, email, phone, address, bio, is_admin FROM users WHERE id = ?', [userId], (err, userResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json({ 
        message: 'User updated successfully',
        user: userResults[0] 
      });
    });
  });
});
// ====================== ADMIN PROFILE ENDPOINTS ====================== //

// Get admin profile
app.get('/api/admin/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT id, username,password,image, email, phone, address, bio FROM admin_users WHERE id = ?';
  
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    res.json(result[0]);
  });
});

// Update admin profile
app.put('/api/admin/users/:id', (req, res) => {
  const userId = req.params.id;
  const { username, password, currentPassword, image, email, phone, address, bio } = req.body;
  
  // First get the current password from DB
  db.query('SELECT password FROM admin_users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const storedPassword = results[0].password;
    
    // If password is being changed, verify current password
    if (password && password !== '') {
      if (!currentPassword || currentPassword !== storedPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }
    
    // Proceed with update
    const sql = `
      UPDATE admin_users 
      SET username = ?, ${password ? 'password = ?,' : ''} image = ?, email = ?, phone = ?, address = ?, bio = ?
      WHERE id = ?
    `;
    
    const params = [
      username,
      ...(password ? [password] : []),
      image, email, phone, address, bio, userId
    ];
    
    db.query(sql, params, (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Profile updated successfully' });
    });
  });
});
// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'img')); // Creates img directory in your backend folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ filename: req.file.filename });
});
// ====================== AUTHENTICATION ENDPOINTS ====================== //

// User Login
app.post('/api/user/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = results[0];
    
    res.cookie('userId', user.id, { maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('username', user.username, { maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('isAdmin', 'false', { maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const sql = 'SELECT * FROM admin_users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const admin = results[0];
    
    res.cookie('userId', admin.id, { maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('username', admin.username, { maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('isAdmin', 'true', { maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    res.json({ 
      message: 'Login successful',
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  });
});
// ====================== USER MANAGEMENT ENDPOINTS ====================== //

// Get all users (for admin)
app.get('/api/admin/users', (req, res) => {
  // Verify admin privileges (you might want to add middleware for this)
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT id, username, email, phone, address, bio, created_at, is_admin FROM users';
  let countSql = 'SELECT COUNT(*) as total FROM users';
  const params = [];
  const countParams = [];

  // Add search filter if provided
  if (search) {
    sql += ' WHERE username LIKE ? OR email LIKE ? OR phone LIKE ?';
    countSql += ' WHERE username LIKE ? OR email LIKE ? OR phone LIKE ?';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm, searchTerm);
  }

  // Add pagination
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  // First get total count
  db.query(countSql, countParams, (countErr, countResults) => {
    if (countErr) {
      console.error(countErr);
      return res.status(500).json({ message: 'Database error' });
    }

    const total = countResults[0].total;

    // Then get paginated results
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        users: results,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    });
  });
});

// Update user (admin)
// In server.js, update the admin user update endpoint
app.put('/api/admin/users/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const userId = req.params.id;
  const { username, email, phone, address, bio, is_admin } = req.body;

  const sql = `
    UPDATE users 
    SET username = ?, email = ?, phone = ?, address = ?, bio = ?, is_admin = ?
    WHERE id = ?
  `;

  db.query(sql, [username, email, phone, address, bio, is_admin, userId], (err, result) => {
    if (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // After update, fetch the updated user data
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, userResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json({ 
        message: 'User updated successfully',
        user: userResults[0] 
      });
    });
  });
});

// Delete user (admin)
app.delete('/api/admin/users/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const userId = req.params.id;

  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Create new user (admin)
app.post('/api/admin/users', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { username, email, password, phone, address, bio, is_admin } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required' });
  }

  const sql = `
    INSERT INTO users 
    (username, email, password, phone, address, bio, is_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql, 
    [username, email, password, phone || null, address || null, bio || null, is_admin || false],
    (err, result) => {
      if (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(201).json({ 
        message: 'User created successfully',
        userId: result.insertId 
      });
    }
  );
});
// Products endpoints
// Configure storage for product images
const productImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'product-img')); // Use product-img folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadProductImg = multer({ storage: productImgStorage });


// Product image upload endpoint
app.post('/api/upload-product-image', uploadProductImg.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ 
    filename: req.file.filename,
    path: `/product-img/${req.file.filename}` // Return the path for frontend use
  });
});


// Get all products (admin)
// This endpoint allows admins to fetch products with pagination and filtering
app.get('/api/admin/products', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { search, page = 1, limit = 10, category } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM products';
  let countSql = 'SELECT COUNT(*) as total FROM products';
  const params = [];
  const countParams = [];

  // Add filters
  const whereClauses = [];
  if (search) {
    whereClauses.push('(name LIKE ? OR description LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm);
  }
  if (category) {
    whereClauses.push('category = ?');
    params.push(category);
    countParams.push(category);
  }

  if (whereClauses.length > 0) {
    const where = ' WHERE ' + whereClauses.join(' AND ');
    sql += where;
    countSql += where;
  }

  // Add pagination
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  // Get total count first
  db.query(countSql, countParams, (countErr, countResults) => {
    if (countErr) {
      console.error(countErr);
      return res.status(500).json({ message: 'Database error' });
    }

    const total = countResults[0].total;

    // Then get paginated results
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        products: results,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    });
  });
});

app.post('/api/admin/products', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { name, description, price, category, stock, image } = req.body;

  if (!name || !description || !price || !category || stock === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO products 
    (name, description, price, category, stock, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, description, price, category, stock, image || null],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      // Return the newly created product
      db.query('SELECT * FROM products WHERE id = ?', [result.insertId], (err, productResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({
          message: 'Product created successfully',
          product: productResults[0]
        });
      });
    }
  );
});

app.put('/api/admin/products/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const productId = req.params.id;
  const { name, description, price, category, stock, image } = req.body;

  const sql = `
    UPDATE products 
    SET name = ?, description = ?, price = ?, category = ?, stock = ?, image = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, description, price, category, stock, image || null, productId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Return the updated product
      db.query('SELECT * FROM products WHERE id = ?', [productId], (err, productResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.json({
          message: 'Product updated successfully',
          product: productResults[0]
        });
      });
    }
  );
});

app.delete('/api/admin/products/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const productId = req.params.id;

  db.query('DELETE FROM products WHERE id = ?', [productId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});
// Add this with your other endpoint declarations


// ====================== BANNER ENDPOINTS ====================== //

// Configure storage for banner images
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'banner-img')); // Use banner-img folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadBannerImg = multer({ storage: bannerStorage });

// Banner image upload endpoint
app.post('/api/upload-banner-image', uploadBannerImg.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ 
    filename: req.file.filename,
    path: `/banner-img/${req.file.filename}` // Return the path for frontend use
  });
});

// Get all banners
app.get('/api/banners', (req, res) => {
  const sql = 'SELECT * FROM banner ORDER BY date DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Get single banner
app.get('/api/banners/:id', (req, res) => {
  const bannerId = req.params.id;
  const sql = 'SELECT * FROM banner WHERE id = ?';
  
  db.query(sql, [bannerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(result[0]);
  });
});

// Create new banner (admin only)
app.post('/api/admin/banners', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { name, details, image, date } = req.body;

  if (!name || !details || !image) {
    return res.status(400).json({ message: 'Name, details and image are required' });
  }

  const sql = `
    INSERT INTO banner 
    (name, details, image, date)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, details, image, date || new Date().toISOString().split('T')[0]],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      // Return the newly created banner
      db.query('SELECT * FROM banner WHERE id = ?', [result.insertId], (err, bannerResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({
          message: 'Banner created successfully',
          banner: bannerResults[0]
        });
      });
    }
  );
});

// Update banner (admin only)
app.put('/api/admin/banners/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const bannerId = req.params.id;
  const { name, details, image, date } = req.body;

  const sql = `
    UPDATE banner 
    SET name = ?, details = ?, image = ?, date = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, details, image, date, bannerId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Banner not found' });
      }
      
      // Return the updated banner
      db.query('SELECT * FROM banner WHERE id = ?', [bannerId], (err, bannerResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.json({
          message: 'Banner updated successfully',
          banner: bannerResults[0]
        });
      });
    }
  );
});

// Delete banner (admin only)
app.delete('/api/admin/banners/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const bannerId = req.params.id;

  db.query('DELETE FROM banner WHERE id = ?', [bannerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  });
});

// ====================== SERVICE ENDPOINTS ====================== //

// Configure storage for service images
const serviceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'service-img')); // Use service-img folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadServiceImg = multer({ storage: serviceStorage });

// Service image upload endpoint
app.post('/api/upload-service-image', uploadServiceImg.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ 
    filename: req.file.filename,
    path: `/service-img/${req.file.filename}` // Return the path for frontend use
  });
});

// Get all services
app.get('/api/services', (req, res) => {
  const sql = 'SELECT * FROM services ORDER BY date DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Get single service
app.get('/api/services/:id', (req, res) => {
  const serviceId = req.params.id;
  const sql = 'SELECT * FROM services WHERE id = ?';
  
  db.query(sql, [serviceId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(result[0]);
  });
});

// Create new service (admin only)
app.post('/api/admin/services', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { name, details, image, date } = req.body;

  if (!name || !details || !image) {
    return res.status(400).json({ message: 'Name, details and image are required' });
  }

  const sql = `
    INSERT INTO services 
    (name, details, image, date)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, details, image, date || new Date().toISOString().split('T')[0]],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      // Return the newly created service
      db.query('SELECT * FROM services WHERE id = ?', [result.insertId], (err, serviceResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({
          message: 'Service created successfully',
          service: serviceResults[0]
        });
      });
    }
  );
});

// Update service (admin only)
app.put('/api/admin/services/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const serviceId = req.params.id;
  const { name, details, image, date } = req.body;

  const sql = `
    UPDATE services 
    SET name = ?, details = ?, image = ?, date = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, details, image, date, serviceId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      // Return the updated service
      db.query('SELECT * FROM services WHERE id = ?', [serviceId], (err, serviceResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.json({
          message: 'Service updated successfully',
          service: serviceResults[0]
        });
      });
    }
  );
});

// Delete service (admin only)
app.delete('/api/admin/services/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const serviceId = req.params.id;

  db.query('DELETE FROM services WHERE id = ?', [serviceId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  });
});





// ====================== CATEGORY ENDPOINTS ====================== //

// Configure storage for category images
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'category-img')); // Use category-img folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadCategoryImg = multer({ storage: categoryStorage });

// Category image upload endpoint
app.post('/api/upload-category-image', uploadCategoryImg.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ 
    filename: req.file.filename,
    path: `/category-img/${req.file.filename}` // Return the path for frontend use
  });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  const sql = 'SELECT * FROM category ORDER BY date DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Get single category
app.get('/api/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const sql = 'SELECT * FROM category WHERE id = ?';
  
  db.query(sql, [categoryId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(result[0]);
  });
});

// Create new category (admin only)
app.post('/api/admin/categories', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { name, details, image, date } = req.body;

  if (!name || !details || !image) {
    return res.status(400).json({ message: 'Name, details and image are required' });
  }

  const sql = `
    INSERT INTO category 
    (name, details, image, date)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, details, image, date || new Date().toISOString().split('T')[0]],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      // Return the newly created category
      db.query('SELECT * FROM category WHERE id = ?', [result.insertId], (err, categoryResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({
          message: 'Category created successfully',
          category: categoryResults[0]
        });
      });
    }
  );
});

// Update category (admin only)
app.put('/api/admin/categories/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const categoryId = req.params.id;
  const { name, details, image, date } = req.body;

  const sql = `
    UPDATE category 
    SET name = ?, details = ?, image = ?, date = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, details, image, date, categoryId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Return the updated category
      db.query('SELECT * FROM category WHERE id = ?', [categoryId], (err, categoryResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.json({
          message: 'Category updated successfully',
          category: categoryResults[0]
        });
      });
    }
  );
});

// Delete category (admin only)
app.delete('/api/admin/categories/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const categoryId = req.params.id;

  db.query('DELETE FROM category WHERE id = ?', [categoryId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  });
});


// Get all products (public endpoint)
app.get('/api/products', (req, res) => {
  const { category, limit = 20 } = req.query;
  
  let sql = 'SELECT * FROM products WHERE stock > 0';
  const params = [];
  
  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit));
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ products: results });
  });
});


// ====================== DEAL ENDPOINTS ====================== //
// Configure storage for deal images
const dealStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'deal-img')); // Use deal-img folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadDealImg = multer({ storage: dealStorage });

// Deal image upload endpoint
app.post('/api/upload-deal-image', uploadDealImg.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ 
    filename: req.file.filename,
    path: `/deal-img/${req.file.filename}` // Return the path for frontend use
  });
});




// Get all deals (with pagination and filtering)
app.get('/api/admin/deals', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { search, page = 1, limit = 10, filter } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM deals';
  let countSql = 'SELECT COUNT(*) as total FROM deals';
  const params = [];
  const countParams = [];

  // Add filters
  const whereClauses = [];
  if (search) {
    whereClauses.push('(deal_name LIKE ? OR product_name LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm);
  }
  
  // Filter by status (active/expired)
  if (filter === 'active') {
    whereClauses.push('deal_valid >= CURDATE()');
  } else if (filter === 'expired') {
    whereClauses.push('deal_valid < CURDATE()');
  }

  if (whereClauses.length > 0) {
    const where = ' WHERE ' + whereClauses.join(' AND ');
    sql += where;
    countSql += where;
  }

  // Add pagination
  sql += ' ORDER BY date DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  // Get total count first
  db.query(countSql, countParams, (countErr, countResults) => {
    if (countErr) {
      console.error(countErr);
      return res.status(500).json({ message: 'Database error' });
    }

    const total = countResults[0].total;

    // Then get paginated results
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        deals: results,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    });
  });
});

// Get single deal
app.get('/api/admin/deals/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const dealId = req.params.id;
  const sql = 'SELECT * FROM deals WHERE id = ?';
  
  db.query(sql, [dealId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.json(result[0]);
  });
});

// Create new deal (admin only)
app.post('/api/admin/deals', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { 
    deal_name, 
    deal_details, 
    deal_valid, 
    product_name, 
    product_details, 
    product_image, 
    product_price, 
    date 
  } = req.body;

  if (!deal_name || !deal_details || !deal_valid || !product_name || !product_price) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO deals 
    (deal_name, deal_details, deal_valid, product_name, product_details, product_image, product_price, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      deal_name, 
      deal_details, 
      deal_valid, 
      product_name, 
      product_details || '', 
      product_image || '', 
      product_price, 
      date || new Date().toISOString().split('T')[0]
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      // Return the newly created deal
      db.query('SELECT * FROM deals WHERE id = ?', [result.insertId], (err, dealResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({
          message: 'Deal created successfully',
          deal: dealResults[0]
        });
      });
    }
  );
});

// Update deal (admin only)
app.put('/api/admin/deals/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const dealId = req.params.id;
  const { 
    deal_name, 
    deal_details, 
    deal_valid, 
    product_name, 
    product_details, 
    product_image, 
    product_price, 
    date 
  } = req.body;

  const sql = `
    UPDATE deals 
    SET deal_name = ?, deal_details = ?, deal_valid = ?, product_name = ?, 
        product_details = ?, product_image = ?, product_price = ?, date = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      deal_name, 
      deal_details, 
      deal_valid, 
      product_name, 
      product_details, 
      product_image, 
      product_price, 
      date, 
      dealId
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Deal not found' });
      }
      
      // Return the updated deal
      db.query('SELECT * FROM deals WHERE id = ?', [dealId], (err, dealResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.json({
          message: 'Deal updated successfully',
          deal: dealResults[0]
        });
      });
    }
  );
});

// Delete deal (admin only)
app.delete('/api/admin/deals/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const dealId = req.params.id;

  db.query('DELETE FROM deals WHERE id = ?', [dealId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.json({ message: 'Deal deleted successfully' });
  });
});

// Get active deals (public endpoint)
app.get('/api/deals', (req, res) => {
  const sql = 'SELECT * FROM deals WHERE deal_valid >= CURDATE() ORDER BY date DESC LIMIT 10';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ deals: results });
  });
});

// ====================== BRAND ENDPOINTS ====================== //

// Configure storage for brand images
const brandStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'brand-img')); // Use brand-img folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadBrandImg = multer({ 
  storage: brandStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Brand image upload endpoint
app.post('/api/upload-brand-image', uploadBrandImg.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }
  
  res.json({ 
    filename: req.file.filename,
    path: `/brand-img/${req.file.filename}` // Return the path for frontend use
  });
});

// Get all brands (admin)
app.get('/api/admin/brands', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM brands';
  let countSql = 'SELECT COUNT(*) as total FROM brands';
  const params = [];
  const countParams = [];

  // Add search filter if provided
  if (search) {
    sql += ' WHERE name LIKE ? OR details LIKE ?';
    countSql += ' WHERE name LIKE ? OR details LIKE ?';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm);
  }

  // Add pagination
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  // Get total count first
  db.query(countSql, countParams, (countErr, countResults) => {
    if (countErr) {
      console.error(countErr);
      return res.status(500).json({ message: 'Database error' });
    }

    const total = countResults[0].total;

    // Then get paginated results
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        brands: results,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    });
  });
});

// Get single brand
app.get('/api/admin/brands/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const brandId = req.params.id;
  const sql = 'SELECT * FROM brands WHERE id = ?';
  
  db.query(sql, [brandId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(result[0]);
  });
});

// Create new brand (admin only)
app.post('/api/admin/brands', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { name, details, image } = req.body;

  if (!name || !details) {
    return res.status(400).json({ message: 'Name and details are required' });
  }

  const sql = `
    INSERT INTO brands 
    (name, details, image)
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [name, details, image || null],
    (err, result) => {
      if (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Brand name already exists' });
        }
        return res.status(500).json({ message: 'Database error' });
      }
      
      // Return the newly created brand
      db.query('SELECT * FROM brands WHERE id = ?', [result.insertId], (err, brandResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({
          message: 'Brand created successfully',
          brand: brandResults[0]
        });
      });
    }
  );
});

// Update brand (admin only)
app.put('/api/admin/brands/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const brandId = req.params.id;
  const { name, details, image } = req.body;

  const sql = `
    UPDATE brands 
    SET name = ?, details = ?, image = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, details, image, brandId],
    (err, result) => {
      if (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Brand name already exists' });
        }
        return res.status(500).json({ message: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Brand not found' });
      }
      
      // Return the updated brand
      db.query('SELECT * FROM brands WHERE id = ?', [brandId], (err, brandResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.json({
          message: 'Brand updated successfully',
          brand: brandResults[0]
        });
      });
    }
  );
});

// Delete brand (admin only)
app.delete('/api/admin/brands/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const brandId = req.params.id;

  db.query('DELETE FROM brands WHERE id = ?', [brandId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json({ message: 'Brand deleted successfully' });
  });
});

// Get all brands (public endpoint)
app.get('/api/brands', (req, res) => {
  const sql = 'SELECT id, name, image, details FROM brands ORDER BY name ASC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ brands: results });
  });
});
// ====================== WEEK DEAL ENDPOINTS ====================== //

// Configure storage for week deal images
const weekdealStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'weekdeal-img')); // Use weekdeal-img folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadWeekdealImg = multer({ 
  storage: weekdealStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Week deal image upload endpoint
app.post('/api/upload-weekdeal-image', uploadWeekdealImg.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }
  
  res.json({ 
    filename: req.file.filename,
    path: `/weekdeal-img/${req.file.filename}` // Return the path for frontend use
  });
});

// Get all week deals (admin)
app.get('/api/admin/weekdeals', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM weekdeals';
  let countSql = 'SELECT COUNT(*) as total FROM weekdeals';
  const params = [];
  const countParams = [];

  // Add search filter if provided
  if (search) {
    sql += ' WHERE deal_name LIKE ? OR deal_details LIKE ? OR product_name LIKE ?';
    countSql += ' WHERE deal_name LIKE ? OR deal_details LIKE ? OR product_name LIKE ?';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm, searchTerm);
  }

  // Add pagination
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  // Get total count first
  db.query(countSql, countParams, (countErr, countResults) => {
    if (countErr) {
      console.error(countErr);
      return res.status(500).json({ message: 'Database error' });
    }

    const total = countResults[0].total;

    // Then get paginated results
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        deals: results,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    });
  });
});

// Get single week deal
app.get('/api/admin/weekdeals/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const weekdealId = req.params.id;
  const sql = 'SELECT * FROM weekdeals WHERE id = ?';
  
  db.query(sql, [weekdealId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Week deal not found' });
    }
    res.json(result[0]);
  });
});

// Create new week deal (admin only)
app.post('/api/admin/weekdeals', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { deal_name, deal_details, product_name, product_details, product_price, product_image, deal_image } = req.body;

  if (!deal_name || !product_name || !product_details || !product_price) {
    return res.status(400).json({ message: 'Deal name, product name, product details and product price are required' });
  }

  const sql = `
    INSERT INTO weekdeals 
    (deal_name, deal_details, product_name, product_details, product_price, product_image, deal_image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [deal_name, deal_details || null, product_name, product_details, product_price, product_image || null, deal_image || null],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      // Return the newly created week deal
      db.query('SELECT * FROM weekdeals WHERE id = ?', [result.insertId], (err, weekdealResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({
          message: 'Week deal created successfully',
          deal: weekdealResults[0]
        });
      });
    }
  );
});

// Update week deal (admin only)
app.put('/api/admin/weekdeals/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const weekdealId = req.params.id;
  const { deal_name, deal_details, product_name, product_details, product_price, product_image, deal_image } = req.body;

  const sql = `
    UPDATE weekdeals 
    SET deal_name = ?, deal_details = ?, product_name = ?, product_details = ?, product_price = ?, product_image = ?, deal_image = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [deal_name, deal_details, product_name, product_details, product_price, product_image, deal_image, weekdealId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Week deal not found' });
      }
      
      // Return the updated week deal
      db.query('SELECT * FROM weekdeals WHERE id = ?', [weekdealId], (err, weekdealResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.json({
          message: 'Week deal updated successfully',
          deal: weekdealResults[0]
        });
      });
    }
  );
});

// Delete week deal (admin only)
app.delete('/api/admin/weekdeals/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const weekdealId = req.params.id;

  db.query('DELETE FROM weekdeals WHERE id = ?', [weekdealId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Week deal not found' });
    }
    res.json({ message: 'Week deal deleted successfully' });
  });
});

// Get active week deals (public endpoint)
app.get('/api/weekdeals', (req, res) => {
  const sql = 'SELECT * FROM weekdeals ORDER BY created_at DESC LIMIT 10';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ deals: results });
  });
});

// blog section starts from here 


// Configure your server routes
// Configure storage for blog images
const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'blog-img')); // Create a blog-img folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadBlogImg = multer({ 
  storage: blogStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Blog image upload endpoint
app.post('/api/upload-blog-image', uploadBlogImg.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }
  
  res.json({ 
    filename: req.file.filename,
    path: `/blog-img/${req.file.filename}`
  });
});
// Get all blogs (admin)
app.get('/api/admin/blogs', (req, res) => {
  // Check admin authentication
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM blog';
  let countSql = 'SELECT COUNT(*) as total FROM blog';
  const params = [];
  const countParams = [];

  // Add search filter if provided
  if (search) {
    sql += ' WHERE name LIKE ? OR details LIKE ? OR keywords LIKE ?';
    countSql += ' WHERE name LIKE ? OR details LIKE ? OR keywords LIKE ?';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm, searchTerm);
  }

  // Add pagination
  sql += ' ORDER BY date DESC, id DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  // Get total count first
  db.query(countSql, countParams, (countErr, countResults) => {
    if (countErr) {
      console.error(countErr);
      return res.status(500).json({ message: 'Database error' });
    }

    const total = countResults[0].total;

    // Then get paginated results
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        blogs: results,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    });
  });
});

// Create new blog (admin only)
app.post('/api/admin/blogs', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { name, details, keywords, date, image } = req.body;

  const sql = `
    INSERT INTO blog 
    (name, details, keywords, date, image)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, details, keywords || '', date || new Date().toISOString().split('T')[0], image || null],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      // Return the newly created blog
      db.query('SELECT * FROM blog WHERE id = ?', [result.insertId], (err, blogResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({
          message: 'Blog created successfully',
          blog: blogResults[0]
        });
      });
    }
  );
});

// Update blog (admin only)
app.put('/api/admin/blogs/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const blogId = req.params.id;
    const { name, details, keywords, date, image } = req.body;

  const sql = `
    UPDATE blog 
    SET name = ?, details = ?, keywords = ?, date = ?, image = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, details, keywords, date, image, blogId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      // Return the updated blog
      db.query('SELECT * FROM blog WHERE id = ?', [blogId], (err, blogResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.json({
          message: 'Blog updated successfully',
          blog: blogResults[0]
        });
      });
    }
  );
});

// Delete blog (admin only)
app.delete('/api/admin/blogs/:id', (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const blogId = req.params.id;

  db.query('DELETE FROM blog WHERE id = ?', [blogId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted successfully' });
  });
});













// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('userId');
  res.clearCookie('username');
  res.clearCookie('isAdmin');
  res.json({ message: 'Logged out successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

