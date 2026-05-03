require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/haj_store')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// ═══════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 },
    selectedImage: { type: String, default: '' }
  }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  images: [{ type: String, required: true }],
  category: { type: String, enum: ['chiffon', 'flowers', 'stan', 'pashamil', 'milt', 'tiger', 'other'], default: 'other' },
  stock: { type: Number, default: 100, min: 0 },
  isBestSeller: { type: Boolean, default: false },
  isNewCollection: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' }
  }],
  totalAmount: { type: Number, required: true },
  shippingInfo: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String, default: '' }
  },
  paymentMethod: { type: String, enum: ['cash', 'visa'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  orderNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const prefix = 'HAJ';
    const timestamp = date.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// ═══════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'مش مسموح ليك تدخل هنا' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'المستخدم مش موجود' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'التوكن مش صحيح' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'مش مسموح، الادمن بس' });
  }
};

// ═══════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'اكمل كل البيانات' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'الباسورد لازم 6 أحرف' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'الإيميل مسجل قبل كده' });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, address: user.address, phone: user.phone }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'اكمل كل البيانات' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'الإيميل او الباسورد غلط' });
    }
    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, address: user.address, phone: user.phone }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Me
app.get('/api/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('orders');
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, address: user.address, phone: user.phone, orders: user.orders }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Profile
app.put('/api/auth/profile', protect, async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, address, phone }, { new: true });
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, address: user.address, phone: user.phone }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════
// PRODUCT ROUTES
// ═══════════════════════════════════════════

// Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, bestseller } = req.query;
    let query = {};
    if (category) query.category = category;
    if (bestseller === 'true') query.isBestSeller = true;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Single Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج مش موجود' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Best Sellers
app.get('/api/products/bestsellers/list', async (req, res) => {
  try {
    const products = await Product.find({ isBestSeller: true }).limit(3);
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Product (Admin)
app.post('/api/products', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════
// CART ROUTES
// ═══════════════════════════════════════════

// Get Cart
app.get('/api/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to Cart
app.post('/api/cart', protect, async (req, res) => {
  try {
    const { productId, quantity, selectedImage } = req.body;
    const user = await User.findById(req.user.id);

    const existingItem = user.cart.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1, selectedImage });
    }

    await user.save();
    await user.populate('cart.product');
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove from Cart
app.delete('/api/cart/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
    await user.save();
    await user.populate('cart.product');
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear Cart
app.delete('/api/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();
    res.json({ success: true, cart: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════
// ORDER ROUTES
// ═══════════════════════════════════════════

// Create Order
app.post('/api/orders', protect, async (req, res) => {
  try {
    const { items, shippingInfo, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'السلة فاضية' });
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      shippingInfo,
      paymentMethod
    });

    // Add order to user
    await User.findByIdAndUpdate(req.user.id, { $push: { orders: order._id } });

    // Clear cart
    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get My Orders
app.get('/api/orders/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Single Order
app.get('/api/orders/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب مش موجود' });
    }
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'مش مسموح' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════

const seedProducts = async () => {
  const products = [
    { name: 'Chiffon hijab with attached inner cap', price: 120, images: ['jel8.jpg','jel3.jpg','jel4.jpg','jel5.jpg','jel6.jpg','jel7.jpg'], category: 'chiffon', isBestSeller: true },
    { name: 'FLOWERS HIJAB', price: 180, images: ['m2.jpg','m3.jpg','m4.jpg','m5.jpg','m6.jpg','m7.jpg'], category: 'flowers', isBestSeller: true },
    { name: 'STAN HIJAB', price: 299, images: ['stan2.jpg','stan3.jpg','stan4.jpg','stan5.jpg','stan6.jpg','stan7.jpg'], category: 'stan', isBestSeller: true },
    { name: 'PASHAMIL HIJAB', price: 250, images: ['p7.jpg','p2.jpg','p8.jpg','p3.jpg','p4.jpg','p5.jpg'], category: 'pashamil' },
    { name: 'MILT HIJAB', price: 150, images: ['c1.jpg','c2.jpg','c4.jpg','c3.jpg','c5.jpg','c6.jpg'], category: 'milt' },
    { name: 'TIGER HIJAB', price: 200, images: ['d1.jpg','d2.jpg','d3.jpg','d5.jpg','d7.jpg'], category: 'tiger' }
  ];

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('✅ Products seeded!');
};

// ═══════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Check if seed flag is passed
  if (process.argv.includes('--seed')) {
    await seedProducts();
    console.log('Seeding complete!');
    process.exit(0);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'حصل خطأ في السيرفر'
  });
});
