const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = 'database.json';
const JWT_SECRET = process.env.JWT_SECRET || 'haj-secret-key-2025';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// ── Database Helpers ─────────────────────────────
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    return { users: {}, orders: {}, products: [], nextUserId: 1, nextOrderId: 1, promoCodes: {} };
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Initialize default products if empty
function initProducts() {
  const db = readDB();
  if (!db.products || db.products.length === 0) {
    db.products = [
      { id: 1, name: 'Chiffon hijab with attached inner cap', price: 120, category: 'chiffon', color: 'multi', imgs: ['jel8.jpg','jel3.jpg','jel4.jpg','jel5.jpg','jel6.jpg','jel7.jpg'], rating: 4.5, reviews: 12, bestseller: true },
      { id: 2, name: 'FLOWERS HIJAB', price: 180, category: 'printed', color: 'multi', imgs: ['m2.jpg','m3.jpg','m4.jpg','m5.jpg','m6.jpg','m7.jpg'], rating: 4.8, reviews: 24, bestseller: true },
      { id: 3, name: 'STAN HIJAB', price: 299, category: 'premium', color: 'black', imgs: ['stan2.jpg','stan3.jpg','stan4.jpg','stan5.jpg','stan6.jpg','stan7.jpg'], rating: 4.9, reviews: 8, bestseller: true },
      { id: 4, name: 'PASHAMIL HIJAB', price: 250, category: 'premium', color: 'beige', imgs: ['p7.jpg','p2.jpg','p8.jpg','p3.jpg','p4.jpg','p5.jpg'], rating: 4.6, reviews: 15, bestseller: false },
      { id: 5, name: 'MILT HIJAB', price: 150, category: 'cotton', color: 'multi', imgs: ['c1.jpg','c2.jpg','c4.jpg','c3.jpg','c5.jpg','c6.jpg'], rating: 4.3, reviews: 6, bestseller: false },
      { id: 6, name: 'TIGER HIJAB', price: 200, category: 'printed', color: 'orange', imgs: ['d1.jpg','d2.jpg','d3.jpg','d5.jpg','d7.jpg'], rating: 4.7, reviews: 18, bestseller: false }
    ];
    db.nextProductId = 7;
    writeDB(db);
  }
}

initProducts();

// ── Auth Middleware ──────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

function adminMiddleware(req, res, next) {
  const db = readDB();
  const user = db.users[req.userId];
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  next();
}

// ── Auth Routes ──────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  
  const db = readDB();
  const existing = Object.values(db.users).find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = `user_${db.nextUserId++}`;
  const user = {
    id: userId,
    name,
    email,
    password: hashedPassword,
    address: '',
    phone: '',
    orders: [],
    cart: [],
    wishlist: [],
    role: email === 'admin@haj.com' ? 'admin' : 'user',
    createdAt: new Date().toISOString()
  };
  
  db.users[userId] = user;
  writeDB(db);
  
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = Object.values(db.users).find(u => u.email === email);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Wrong email or password' });
  }
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, address: user.address }
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const db = readDB();
  const user = db.users[req.userId];
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      role: user.role,
      orders: user.orders,
      wishlist: user.wishlist
    }
  });
});

app.put('/api/auth/profile', authMiddleware, (req, res) => {
  const { name, address, phone } = req.body;
  const db = readDB();
  const user = db.users[req.userId];
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  if (name) user.name = name;
  if (address !== undefined) user.address = address;
  if (phone !== undefined) user.phone = phone;
  
  writeDB(db);
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, address: user.address, phone: user.phone } });
});

// ── Products Routes ──────────────────────────────
app.get('/api/products', (req, res) => {
  const db = readDB();
  let products = db.products || [];
  
  // Filter
  const { category, color, minPrice, maxPrice, search } = req.query;
  if (category) products = products.filter(p => p.category === category);
  if (color) products = products.filter(p => p.color === color);
  if (minPrice) products = products.filter(p => p.price >= Number(minPrice));
  if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice));
  if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  
  res.json({ success: true, products });
});

app.get('/api/products/bestsellers', (req, res) => {
  const db = readDB();
  const products = (db.products || []).filter(p => p.bestseller);
  res.json({ success: true, products });
});

app.get('/api/products/:id', (req, res) => {
  const db = readDB();
  const product = (db.products || []).find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

// ── Wishlist Routes ──────────────────────────────
app.get('/api/wishlist', authMiddleware, (req, res) => {
  const db = readDB();
  const user = db.users[req.userId];
  const wishlistProducts = (db.products || []).filter(p => user.wishlist.includes(p.id));
  res.json({ success: true, wishlist: wishlistProducts });
});

app.post('/api/wishlist/:productId', authMiddleware, (req, res) => {
  const db = readDB();
  const user = db.users[req.userId];
  const productId = Number(req.params.productId);
  
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    writeDB(db);
  }
  res.json({ success: true, wishlist: user.wishlist });
});

app.delete('/api/wishlist/:productId', authMiddleware, (req, res) => {
  const db = readDB();
  const user = db.users[req.userId];
  user.wishlist = user.wishlist.filter(id => id !== Number(req.params.productId));
  writeDB(db);
  res.json({ success: true, wishlist: user.wishlist });
});

// ── Orders Routes ────────────────────────────────
app.post('/api/orders', authMiddleware, (req, res) => {
  const { items, shippingInfo, paymentMethod, promoCode } = req.body;
  if (!items || !shippingInfo) {
    return res.status(400).json({ success: false, message: 'Missing order data' });
  }
  
  const db = readDB();
  const user = db.users[req.userId];
  
  let discount = 0;
  if (promoCode && db.promoCodes?.[promoCode]) {
    discount = db.promoCodes[promoCode].discount;
  }
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);
  
  const orderId = `ORD-${Date.now()}`;
  const order = {
    id: orderId,
    userId: req.userId,
    items,
    shippingInfo,
    paymentMethod,
    promoCode,
    discount,
    subtotal,
    totalAmount: total,
    status: 'pending',
    trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.orders[orderId] = order;
  user.orders.push(orderId);
  writeDB(db);
  
  res.json({ success: true, order: { ...order, orderNumber: orderId } });
});

app.get('/api/orders', authMiddleware, (req, res) => {
  const db = readDB();
  const user = db.users[req.userId];
  const orders = user.orders.map(id => db.orders[id]).filter(Boolean);
  res.json({ success: true, orders });
});

app.get('/api/orders/:id/track', authMiddleware, (req, res) => {
  const db = readDB();
  const order = db.orders[req.params.id];
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  // Simulate tracking stages
  const stages = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStage = stages.indexOf(order.status);
  const tracking = stages.map((stage, idx) => ({
    stage,
    completed: idx <= currentStage,
    date: idx <= currentStage ? new Date(Date.now() - (currentStage - idx) * 86400000).toISOString() : null
  }));
  
  res.json({ success: true, tracking, order });
});

// ── Reviews Routes ───────────────────────────────
app.post('/api/products/:id/reviews', authMiddleware, (req, res) => {
  const { rating, comment } = req.body;
  const db = readDB();
  const product = (db.products || []).find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  
  if (!product.reviewsList) product.reviewsList = [];
  product.reviewsList.push({
    userId: req.userId,
    userName: db.users[req.userId].name,
    rating,
    comment,
    date: new Date().toISOString()
  });
  
  // Update average rating
  const total = product.reviewsList.reduce((sum, r) => sum + r.rating, 0);
  product.rating = (total / product.reviewsList.length).toFixed(1);
  product.reviews = product.reviewsList.length;
  
  writeDB(db);
  res.json({ success: true, review: product.reviewsList[product.reviewsList.length - 1] });
});

// ── Promo Codes ──────────────────────────────────
app.post('/api/promo/validate', (req, res) => {
  const { code } = req.body;
  const db = readDB();
  const promo = db.promoCodes?.[code];
  
  if (!promo) return res.status(400).json({ success: false, message: 'Invalid promo code' });
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return res.status(400).json({ success: false, message: 'Promo code expired' });
  }
  
  res.json({ success: true, promo: { code, discount: promo.discount } });
});

// ── Admin Routes ─────────────────────────────────
app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req, res) => {
  const db = readDB();
  const orders = Object.values(db.orders);
  const users = Object.values(db.users);
  
  const stats = {
    totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    totalOrders: orders.length,
    totalUsers: users.filter(u => u.role === 'user').length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalProducts: (db.products || []).length
  };
  
  res.json({ success: true, stats });
});

app.get('/api/admin/orders', authMiddleware, adminMiddleware, (req, res) => {
  const db = readDB();
  const orders = Object.values(db.orders).map(o => ({
    ...o,
    customerName: db.users[o.userId]?.name || 'Unknown'
  }));
  res.json({ success: true, orders });
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const db = readDB();
  const users = Object.values(db.users).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    ordersCount: u.orders.length,
    createdAt: u.createdAt
  }));
  res.json({ success: true, users });
});

app.put('/api/admin/orders/:id/status', authMiddleware, adminMiddleware, (req, res) => {
  const { status } = req.body;
  const db = readDB();
  const order = db.orders[req.params.id];
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  order.status = status;
  order.updatedAt = new Date().toISOString();
  writeDB(db);
  
  res.json({ success: true, order });
});

app.post('/api/admin/products', authMiddleware, adminMiddleware, (req, res) => {
  const { name, price, category, color, imgs } = req.body;
  const db = readDB();
  
  const newProduct = {
    id: db.nextProductId++,
    name,
    price: Number(price),
    category,
    color,
    imgs,
    rating: 0,
    reviews: 0,
    reviewsList: [],
    bestseller: false,
    createdAt: new Date().toISOString()
  };
  
  db.products.push(newProduct);
  writeDB(db);
  res.json({ success: true, product: newProduct });
});

app.delete('/api/admin/products/:id', authMiddleware, adminMiddleware, (req, res) => {
  const db = readDB();
  db.products = (db.products || []).filter(p => p.id != req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// ── Start Server ─────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});