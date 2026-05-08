const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const USERS_FILE = 'users.json';
const ORDERS_FILE = 'orders.json';

// ── helpers ──────────────────────────────────────────────
function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function respond(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

// ── server ───────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    respond(res, 200, {});
    return;
  }

  const url = req.url;

  // ── تسجيل حساب جديد ──
  if (url === '/register' && req.method === 'POST') {
    const { name, email, password } = await parseBody(req);

    if (!name || !email || !password)
      return respond(res, 400, { error: 'كل الحقول مطلوبة' });

    const users = readJSON(USERS_FILE);
    if (users.find(u => u.email === email))
      return respond(res, 400, { error: 'الإيميل ده مسجل قبل كده' });

    users.push({ id: Date.now(), name, email, password });
    writeJSON(USERS_FILE, users);
    return respond(res, 201, { message: 'تم إنشاء الحساب بنجاح!' });
  }

  // ── تسجيل دخول ──
  if (url === '/login' && req.method === 'POST') {
    const { email, password } = await parseBody(req);

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === email && u.password === password);

    if (!user)
      return respond(res, 401, { error: 'الإيميل أو الباسورد غلط' });

    return respond(res, 200, { message: 'تم تسجيل الدخول!', user: { id: user.id, name: user.name, email: user.email } });
  }

  // ── إضافة أوردر ──
  if (url === '/order' && req.method === 'POST') {
    const { name, phone, address, items, total } = await parseBody(req);

    if (!name || !phone || !address || !items)
      return respond(res, 400, { error: 'بيانات الأوردر ناقصة' });

    const orders = readJSON(ORDERS_FILE);
    const order = {
      id: Date.now(),
      name, phone, address, items, total,
      date: new Date().toLocaleString('ar-EG'),
      status: 'جديد'
    };
    orders.push(order);
    writeJSON(ORDERS_FILE, orders);
    return respond(res, 201, { message: 'تم استلام أوردرك!', orderId: order.id });
  }

  // ── عرض كل الأوردرات ──
  if (url === '/orders' && req.method === 'GET') {
    const orders = readJSON(ORDERS_FILE);
    return respond(res, 200, orders);
  }

  // ── الصفحة الرئيسية ──
  respond(res, 200, { message: 'السيرفر شغال ✅' });
});

server.listen(PORT, () => {
  console.log(`✅ السيرفر شغال على http://localhost:${PORT}`);
});