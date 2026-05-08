/* ═══════════════════════════════════════════
   API URL
   ═══════════════════════════════════════════ */
const API_URL = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      throw new Error(data.message || `HTTP ${res.status}`);
    }
    return data;
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
}

/* ═══════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════ */
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ═══════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════ */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

/* ═══════════════════════════════════════════
   PASSWORD STRENGTH
   ═══════════════════════════════════════════ */
function checkPasswordStrength(password) {
  const strengthEl = document.getElementById('password-strength');
  if (!strengthEl) return;
  
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  const classes = ['', 'weak', 'weak', 'medium', 'medium', 'strong'];
  const labels = ['', 'Weak', 'Weak', 'Medium', 'Medium', 'Strong'];
  const colors = ['', '#e07070', '#e07070', '#f0ad4e', '#f0ad4e', '#5a9e6f'];
  
  strengthEl.innerHTML = `<div class="password-strength-bar ${classes[strength]}"></div>
    <span style="font-size:11px;color:${colors[strength]}">${labels[strength]}</span>`;
}

/* ═══════════════════════════════════════════
   MODALS
   ═══════════════════════════════════════════ */
function openQuickView(productId) {
  const product = allProducts.find(p => p.id == productId);
  if (!product) return;
  
  const modal = document.getElementById('quick-view-modal');
  const content = document.getElementById('quick-view-content');
  
  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;">
      <div>
        <img src="${product.imgs[0]}" style="width:100%;border-radius:12px;aspect-ratio:3/4;object-fit:cover;"/>
        <div style="display:flex;gap:8px;margin-top:12px;">
          ${product.imgs.slice(1,4).map(img => `<img src="${img}" style="width:60px;height:75px;object-fit:cover;border-radius:6px;cursor:pointer;"/>`).join('')}
        </div>
      </div>
      <div>
        <h2 style="font-family:'Playfair Display',serif;margin-bottom:8px;">${product.name}</h2>
        <div class="product-rating"><span class="stars">${'⭐'.repeat(Math.floor(product.rating || 0))}</span><span class="review-count">(${product.reviews || 0} reviews)</span></div>
        <p style="font-size:24px;color:var(--accent);font-weight:700;margin-bottom:16px;">${product.price} EG</p>
        <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:24px;">Premium quality hijab made with care. Perfect for daily wear or special occasions.</p>
        <div style="display:flex;gap:12px;">
          <button class="nc-add-btn" onclick="addToCartDirect('img-product${product.id}','${product.name}','${product.price}',this);closeQuickView();">Add to Cart</button>
          <button class="back-btn" onclick="toggleWishlistItem(${product.id});closeQuickView();">⭐ Wishlist</button>
        </div>
        <button class="read-more-btn" onclick="openSizeGuide();closeQuickView();" style="margin-top:16px;width:100%;text-align:center;">📏 Size Guide</button>
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (modal) modal.style.display = 'none';
}

function openSizeGuide() {
  const modal = document.getElementById('size-guide-modal');
  if (modal) modal.style.display = 'flex';
}

function closeSizeGuide() {
  const modal = document.getElementById('size-guide-modal');
  if (modal) modal.style.display = 'none';
}

/* ═══════════════════════════════════════════
   MENU
   ═══════════════════════════════════════════ */
function toggleMenu() {
  const navLinks = document.getElementById('nav-links');
  if (navLinks) navLinks.classList.toggle('open');
}

function closeMenu() {
  const navLinks = document.getElementById('nav-links');
  if (navLinks) navLinks.classList.remove('open');
}

/* ═══════════════════════════════════════════
   SCROLL
   ═══════════════════════════════════════════ */
function scrollToHome() {
  closeMenu();
  document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
}
function scrollToProducts() {
  closeMenu();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}
function scrollToAbout() {
  closeMenu();
  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
}
function scrollToContact() {
  closeMenu();
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
}

/* ═══════════════════════════════════════════
   PRODUCTS
   ═══════════════════════════════════════════ */
let allProducts = [];

async function loadProducts() {
  try {
    const data = await apiRequest('/products');
    allProducts = data.products || [];
    renderBestSellers(allProducts.filter(p => p.bestseller).slice(0, 3));
    return allProducts;
  } catch (e) {
    console.log('API failed, using fallback');
    allProducts = [
      { id:1, name:'Chiffon hijab with attached inner cap', price:120, category:'chiffon', color:'multi', imgs:['jel8.jpg','jel3.jpg','jel4.jpg'], rating:4.5, reviews:12, bestseller:true },
      { id:2, name:'FLOWERS HIJAB', price:180, category:'printed', color:'multi', imgs:['m2.jpg','m3.jpg','m4.jpg'], rating:4.8, reviews:24, bestseller:true },
      { id:3, name:'STAN HIJAB', price:299, category:'premium', color:'black', imgs:['stan2.jpg','stan3.jpg','stan4.jpg'], rating:4.9, reviews:8, bestseller:true },
      { id:4, name:'PASHAMIL HIJAB', price:250, category:'premium', color:'beige', imgs:['p7.jpg','p2.jpg','p8.jpg'], rating:4.6, reviews:15, bestseller:false },
      { id:5, name:'MILT HIJAB', price:150, category:'cotton', color:'multi', imgs:['c1.jpg','c2.jpg','c4.jpg'], rating:4.3, reviews:6, bestseller:false },
      { id:6, name:'TIGER HIJAB', price:200, category:'printed', color:'orange', imgs:['d1.jpg','d2.jpg','d3.jpg'], rating:4.7, reviews:18, bestseller:false }
    ];
    renderBestSellers(allProducts.slice(0, 3));
    return allProducts;
  }
}

/* ═══════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════ */
function renderBestSellers(products) {
  const container = document.getElementById('best-sellers-container');
  if (!container) return;
  
  container.innerHTML = products.map(p => `
    <div class="product-card" onclick="addToCartSimple('${p.name}','${p.price}','${p.imgs[0]}',event)">
      <div style="position:relative;">
        <img src="${p.imgs[0]}" alt="${p.name}"/>
        <button class="wishlist-btn" onclick="event.stopPropagation();toggleWishlistItem(${p.id})" id="wishlist-btn-${p.id}">🤍</button>
        <button class="quick-view-btn" onclick="event.stopPropagation();openQuickView(${p.id})">Quick View</button>
      </div>
      <div class="product-rating"><span class="stars">${'⭐'.repeat(Math.floor(p.rating || 0))}</span><span class="review-count">(${p.reviews || 0})</span></div>
      <p class="product-name">${p.name}</p>
      <p class="product-price">${p.price} EG</p>
    </div>
  `).join('');
  
  updateWishlistButtons();
}

function renderProducts(products) {
  const container = document.getElementById('nc-products-container');
  if (!container) return;
  
  container.innerHTML = products.map(p => `
    <div class="nc-card">
      <div class="nc-main-wrap">
        <img class="nc-main-img" id="img-product${p.id}" src="${p.imgs[0]}" alt="${p.name}"/>
        <button class="wishlist-btn" onclick="event.stopPropagation();toggleWishlistItem(${p.id})" id="wishlist-btn-nc-${p.id}" style="top:10px;right:10px;">🤍</button>
        <button class="quick-view-btn" onclick="event.stopPropagation();openQuickView(${p.id})">Quick View</button>
      </div>
      <div class="nc-thumbs">
        ${p.imgs.map(img => `<img class="nc-thumb" src="${img}" onclick="changeMainImg('product${p.id}',this)" alt=""/>`).join('')}
      </div>
      <div class="nc-info">
        <div class="product-rating" style="justify-content:center;"><span class="stars">${'⭐'.repeat(Math.floor(p.rating || 0))}</span><span class="review-count">(${p.reviews || 0})</span></div>
        <h3 class="nc-name">${p.name}</h3>
        <p class="nc-price">${p.price} EG</p>
        <a class="nc-add-btn" onclick="addToCartDirect('img-product${p.id}','${p.name}','${p.price}',this)">Add to Cart</a>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.nc-card').forEach(card => {
    const firstThumb = card.querySelector('.nc-thumb');
    if (firstThumb) firstThumb.classList.add('active');
  });
  
  updateWishlistButtons();
}

/* ═══════════════════════════════════════════
   FILTERS
   ═══════════════════════════════════════════ */
function applyFilters() {
  const category = document.getElementById('filter-category')?.value;
  const color = document.getElementById('filter-color')?.value;
  const maxPrice = document.getElementById('price-range')?.value;
  
  let filtered = [...allProducts];
  if (category) filtered = filtered.filter(p => p.category === category);
  if (color) filtered = filtered.filter(p => p.color === color);
  if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));
  
  renderProducts(filtered);
}

function clearFilters() {
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-color').value = '';
  document.getElementById('price-range').value = 500;
  updatePriceLabel(500);
  renderProducts(allProducts);
}

function updatePriceLabel(value) {
  const label = document.getElementById('price-label');
  if (label) label.textContent = `Max: ${value} EG`;
}

/* ═══════════════════════════════════════════
   SEARCH
   ═══════════════════════════════════════════ */
function handleSearch(query) {
  const q = query.toLowerCase().trim();
  
  const main = document.getElementById('search-input');
  const nc = document.getElementById('search-input-nc');
  if (main && main.value !== query) main.value = query;
  if (nc && nc.value !== query) nc.value = query;
  
  if (q === '') {
    renderProducts(allProducts);
    return;
  }
  
  const results = allProducts.filter(p => p.name.toLowerCase().includes(q));
  showPage('new-collection');
  
  if (results.length > 0) {
    renderProducts(results);
  } else {
    const container = document.getElementById('nc-products-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align:center;padding:80px 20px;color:var(--text-muted);grid-column:1/-1;">
          <p style="font-size:48px;margin-bottom:16px;">🔍</p>
          <p style="font-size:18px;font-family:'Playfair Display',serif;color:var(--text-primary);margin-bottom:8px;">No results for "${query}"</p>
          <p style="font-size:13px;">Try: Chiffon · Flowers · Stan · Pashamil · Milt · Tiger</p>
          <a onclick="clearSearch()" style="display:inline-block;margin-top:20px;background:var(--text-primary);color:#fff;padding:10px 28px;border-radius:20px;cursor:pointer;font-size:13px;">Show All Products</a>
        </div>
      `;
    }
  }
}

function clearSearch() {
  const main = document.getElementById('search-input');
  const nc = document.getElementById('search-input-nc');
  if (main) main.value = '';
  if (nc) nc.value = '';
  renderProducts(allProducts);
}

/* ═══════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════ */
function showPage(page) {
  const pages = ['main-page','checkout-page','new-collection-page','account-page','success-page','admin-page','tracking-page'];
  pages.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  
  const map = {
    'main': 'main-page',
    'checkout': 'checkout-page',
    'new-collection': 'new-collection-page',
    'account': 'account-page',
    'success': 'success-page',
    'admin': 'admin-page',
    'tracking': 'tracking-page'
  };
  
  const target = document.getElementById(map[page]);
  if (target) target.style.display = 'block';
  window.scrollTo(0, 0);
  closeMenu();
  
  if (page === 'new-collection') {
    loadProducts().then(() => renderProducts(allProducts));
  }
}

/* ═══════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════ */
let currentUser = null;

function openAuth() {
  const el = document.getElementById('auth-overlay');
  if (el) el.style.display = 'flex';
  switchTab('login');
}

function closeAuth() {
  const el = document.getElementById('auth-overlay');
  if (el) el.style.display = 'none';
  const loginErr = document.getElementById('login-error');
  const signupErr = document.getElementById('signup-error');
  if (loginErr) loginErr.innerText = '';
  if (signupErr) signupErr.innerText = '';
}

function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  
  if (loginForm) loginForm.style.display = tab === 'login' ? 'block' : 'none';
  if (signupForm) signupForm.style.display = tab === 'signup' ? 'block' : 'none';
  if (tabLogin) tabLogin.classList.toggle('active', tab === 'login');
  if (tabSignup) tabSignup.classList.toggle('active', tab === 'signup');
  
  const loginErr = document.getElementById('login-error');
  const signupErr = document.getElementById('signup-error');
  if (loginErr) loginErr.innerText = '';
  if (signupErr) signupErr.innerText = '';
}

async function signup() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass = document.getElementById('signup-pass').value;
  const err = document.getElementById('signup-error');
  const btn = document.getElementById('signup-btn');
  
  if (!name || !email || !pass) {
    if (err) err.innerText = 'Please fill all fields.';
    return;
  }
  if (pass.length < 6) {
    if (err) err.innerText = 'Password must be 6+ characters.';
    return;
  }
  
  if (btn) { btn.innerText = 'Creating...'; btn.disabled = true; }
  
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass })
    });
    
    localStorage.setItem('token', data.token);
    loginUser(data.user);
    closeAuth();
    showToast('Account created successfully!', 'success');
    if (err) err.innerText = '';
  } catch (e) {
    if (err) err.innerText = e.message || 'Registration failed';
  } finally {
    if (btn) { btn.innerText = 'Create Account'; btn.disabled = false; }
  }
}

async function login() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  
  if (!email || !pass) {
    if (err) err.innerText = 'Please fill all fields.';
    return;
  }
  
  if (btn) { btn.innerText = 'Logging in...'; btn.disabled = true; }
  
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });
    
    localStorage.setItem('token', data.token);
    loginUser(data.user);
    closeAuth();
    showToast('Welcome back!', 'success');
    if (err) err.innerText = '';
  } catch (e) {
    if (err) err.innerText = e.message || 'Wrong email or password.';
  } finally {
    if (btn) { btn.innerText = 'Login'; btn.disabled = false; }
  }
}

function loginUser(user) {
  if (!user) return;
  currentUser = user;
  const navLabel = document.getElementById('nav-account-label');
  if (navLabel) navLabel.innerText = user.name ? user.name.split(' ')[0] : 'User';
  
  const addrField = document.getElementById('customer-address');
  if (addrField && user.address) addrField.value = user.address;
  
  const savedAddr = document.getElementById('saved-address');
  if (savedAddr && user.address) savedAddr.value = user.address;
  
  const savedPhone = document.getElementById('saved-phone');
  if (savedPhone && user.phone) savedPhone.value = user.phone;
  
  const adminBtn = document.getElementById('admin-nav-btn');
  if (adminBtn) adminBtn.style.display = user.role === 'admin' ? 'block' : 'none';
  
  loadWishlist();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('token');
  const navLabel = document.getElementById('nav-account-label');
  if (navLabel) navLabel.innerText = 'Login';
  const adminBtn = document.getElementById('admin-nav-btn');
  if (adminBtn) adminBtn.style.display = 'none';
  showPage('main');
  showToast('Logged out successfully', 'info');
}

function handleAccountClick() {
  if (currentUser) { loadAccountPage(); showPage('account'); }
  else { openAuth(); }
}

async function loadAccountPage() {
  if (!currentUser) return;
  
  try {
    const data = await apiRequest('/auth/me');
    const user = data.user;
    if (!user) return;
    currentUser = user;
    
    const nameDisplay = document.getElementById('account-name-display');
    const emailDisplay = document.getElementById('account-email-display');
    const savedAddr = document.getElementById('saved-address');
    const savedPhone = document.getElementById('saved-phone');
    const ordersList = document.getElementById('orders-list');
    const wishlistEl = document.getElementById('account-wishlist');
    
    if (nameDisplay) nameDisplay.innerText = '👤 ' + (user.name || 'Unknown');
    if (emailDisplay) emailDisplay.innerText = '📧 ' + (user.email || 'No email');
    if (savedAddr) savedAddr.value = user.address || '';
    if (savedPhone) savedPhone.value = user.phone || '';
    
    const ordersData = await apiRequest('/orders');
    const orders = ordersData.orders || [];
    if (ordersList) {
      ordersList.innerHTML = orders.length === 0
        ? '<p style="color:var(--text-muted);font-size:13px;">No orders yet.</p>'
        : orders.map(o => `
            <div class="order-item">
              <p class="order-date">${new Date(o.createdAt).toLocaleDateString()} — <span class="abadge abadge-${o.status}">${o.status}</span></p>
              <p class="order-items-text">${o.items ? o.items.map(i => i.name).join(', ') : ''}</p>
              <p class="order-total">${o.totalAmount || 0} EG</p>
              ${o.trackingNumber ? `<p style="font-size:11px;color:var(--text-muted);">Tracking: ${o.trackingNumber}</p>` : ''}
            </div>`).join('');
    }
    
    const wishlistData = await apiRequest('/wishlist');
    const wishlist = wishlistData.wishlist || [];
    if (wishlistEl) {
      wishlistEl.innerHTML = wishlist.length === 0
        ? '<p style="color:var(--text-muted);font-size:13px;">No items in wishlist.</p>'
        : wishlist.map(p => `
            <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;padding:10px;background:var(--bg-primary);border-radius:8px;">
              <img src="${p.imgs[0]}" style="width:50px;height:60px;object-fit:cover;border-radius:6px;"/>
              <div style="flex:1;">
                <p style="font-size:13px;font-weight:600;">${p.name}</p>
                <p style="font-size:12px;color:var(--accent);">${p.price} EG</p>
              </div>
              <button onclick="toggleWishlistItem(${p.id})" style="background:none;border:none;color:var(--error);cursor:pointer;font-size:16px;">✕</button>
            </div>`).join('');
    }
  } catch (e) {
    console.error('Failed to load account:', e);
  }
}

async function saveProfile() {
  if (!currentUser) return;
  const addrEl = document.getElementById('saved-address');
  const phoneEl = document.getElementById('saved-phone');
  if (!addrEl || !phoneEl) return;
  
  try {
    await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ address: addrEl.value.trim(), phone: phoneEl.value.trim() })
    });
    currentUser.address = addrEl.value.trim();
    currentUser.phone = phoneEl.value.trim();
    showToast('Profile saved! ✅', 'success');
  } catch (e) {
    showToast('Failed to save profile', 'error');
  }
}

async function checkAuth() {
  const token = getToken();
  if (!token) return;
  
  try {
    const data = await apiRequest('/auth/me');
    if (data.user) {
      loginUser(data.user);
    }
  } catch (e) {
    console.log('Auth check failed, clearing token');
    localStorage.removeItem('token');
  }
}

/* ═══════════════════════════════════════════
   WISHLIST
   ═══════════════════════════════════════════ */
let wishlist = [];

async function loadWishlist() {
  if (!currentUser) {
    wishlist = JSON.parse(localStorage.getItem('wishlist_guest') || '[]');
    updateWishlistUI();
    return;
  }
  
  try {
    const data = await apiRequest('/wishlist');
    wishlist = data.wishlist.map(p => p.id);
    updateWishlistUI();
  } catch (e) {
    console.error('Failed to load wishlist:', e);
  }
}

async function toggleWishlistItem(productId) {
  const isInWishlist = wishlist.includes(productId);
  
  if (currentUser) {
    try {
      if (isInWishlist) {
        await apiRequest(`/wishlist/${productId}`, { method: 'DELETE' });
        wishlist = wishlist.filter(id => id !== productId);
        showToast('Removed from wishlist', 'info');
      } else {
        await apiRequest(`/wishlist/${productId}`, { method: 'POST' });
        wishlist.push(productId);
        showToast('Added to wishlist! ⭐', 'success');
      }
    } catch (e) {
      showToast('Failed to update wishlist', 'error');
      return;
    }
  } else {
    if (isInWishlist) {
      wishlist = wishlist.filter(id => id !== productId);
      showToast('Removed from wishlist', 'info');
    } else {
      wishlist.push(productId);
      showToast('Added to wishlist! ⭐', 'success');
    }
    localStorage.setItem('wishlist_guest', JSON.stringify(wishlist));
  }
  
  updateWishlistUI();
  updateWishlistButtons();
}

function updateWishlistUI() {
  const counts = document.querySelectorAll('#wishlist-count, #wishlist-count-nc');
  counts.forEach(el => el.innerText = wishlist.length);
}

function updateWishlistButtons() {
  wishlist.forEach(id => {
    const btn = document.getElementById(`wishlist-btn-${id}`);
    const btnNc = document.getElementById(`wishlist-btn-nc-${id}`);
    if (btn) { btn.innerHTML = '❤️'; btn.classList.add('active'); }
    if (btnNc) { btnNc.innerHTML = '❤️'; btnNc.classList.add('active'); }
  });
}

function openWishlist() {
  const el = document.getElementById('wishlist');
  const items = document.getElementById('wishlist-items');
  if (!el || !items) return;
  
  if (wishlist.length === 0) {
    items.innerHTML = '<p class="cart-empty">Your wishlist is empty</p>';
  } else {
    const products = allProducts.filter(p => wishlist.includes(p.id));
    items.innerHTML = products.map(p => `
      <div class="cart-item">
        <img src="${p.imgs[0]}" alt="${p.name}"/>
        <div class="cart-item-info">
          <p class="cart-item-name">${p.name}</p>
          <p class="cart-item-price">${p.price} EG</p>
        </div>
        <button class="cart-item-remove" onclick="toggleWishlistItem(${p.id});openWishlist();">✕</button>
      </div>
    `).join('');
  }
  
  el.style.display = 'flex';
}

function closeWishlist() {
  const el = document.getElementById('wishlist');
  if (el) el.style.display = 'none';
}

/* ═══════════════════════════════════════════
   CART
   ═══════════════════════════════════════════ */
let cart = [];

function updateCart() {
  const cartCount = document.getElementById('cart-count');
  const cartCountNc = document.getElementById('cart-count-nc');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  
  if (cartCount) cartCount.innerText = cart.length;
  if (cartCountNc) cartCountNc.innerText = cart.length;
  
  if (!cartItems || !cartTotal) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
    cartTotal.innerText = '0 EG';
    return;
  }
  
  let total = 0;
  cartItems.innerHTML = cart.map((item, i) => {
    total += parseInt(item.price) * (item.quantity || 1);
    return `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}"/>
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">${item.price} EG ${item.quantity > 1 ? 'x' + item.quantity : ''}</p>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${i})">✕</button>
      </div>`;
  }).join('');
  cartTotal.innerText = total + ' EG';
}

function addToCartSimple(name, price, img, e) {
  cart.push({ name, price, img, quantity: 1 });
  updateCart();
  showToast('Added to cart! 🛒', 'success');
  if (e && e.currentTarget) {
    e.currentTarget.style.opacity = '0.6';
    setTimeout(() => e.currentTarget.style.opacity = '1', 400);
  }
}

function addToCartDirect(imgId, name, price, btn) {
  const imgEl = document.getElementById(imgId);
  if (!imgEl) return;
  const card = imgEl.closest('.nc-card') || imgEl.closest('.product-card');
  if (!card) return;
  const activeThumb = card.querySelector('.nc-thumb.active');
  const img = activeThumb ? activeThumb.src : imgEl.src;
  cart.push({ name, price, img, quantity: 1 });
  updateCart();
  showToast('Added to cart! 🛒', 'success');
  if (btn) {
    btn.innerText = '✓ Added!';
    btn.style.background = '#5a9e6f';
    btn.style.pointerEvents = 'none';
    setTimeout(() => {
      btn.innerText = 'Add to Cart';
      btn.style.background = '';
      btn.style.pointerEvents = 'auto';
    }, 1200);
  }
}

function removeFromCart(i) { cart.splice(i, 1); updateCart(); }

function openCart() {
  const el = document.getElementById('cart');
  if (el) el.style.display = 'flex';
}
function closeCart() {
  const el = document.getElementById('cart');
  if (el) el.style.display = 'none';
}

/* ═══════════════════════════════════════════
   CHECKOUT
   ═══════════════════════════════════════════ */
let selectedPayment = 'cash';
let appliedPromo = null;

function selectPayment(method) {
  selectedPayment = method;
  const optCash = document.getElementById('opt-cash');
  const optVisa = document.getElementById('opt-visa');
  const optVodafone = document.getElementById('opt-vodafone');
  const visaForm = document.getElementById('visa-form');
  
  if (optCash) optCash.classList.toggle('active', method === 'cash');
  if (optVisa) optVisa.classList.toggle('active', method === 'visa');
  if (optVodafone) optVodafone.classList.toggle('active', method === 'vodafone');
  if (visaForm) visaForm.style.display = method === 'visa' ? 'block' : 'none';
}

async function applyPromo() {
  const code = document.getElementById('promo-code')?.value.trim();
  const msgEl = document.getElementById('promo-message');
  if (!code) return;
  
  try {
    const data = await apiRequest('/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    appliedPromo = data.promo;
    if (msgEl) {
      msgEl.innerHTML = `<span style="color:var(--success);">✓ ${code} applied! -${data.promo.discount} EG off</span>`;
    }
    updateCheckoutTotal();
  } catch (e) {
    if (msgEl) msgEl.innerHTML = `<span style="color:var(--error);">✗ ${e.message}</span>`;
    appliedPromo = null;
  }
}

function updateCheckoutTotal() {
  const subtotal = cart.reduce((sum, item) => sum + (parseInt(item.price) * (item.quantity || 1)), 0);
  const discount = appliedPromo ? appliedPromo.discount : 0;
  const total = Math.max(0, subtotal - discount);
  
  const subtotalEl = document.getElementById('checkout-subtotal');
  const discountRow = document.getElementById('discount-row');
  const discountEl = document.getElementById('checkout-discount');
  const totalEl = document.getElementById('checkout-total-price');
  
  if (subtotalEl) subtotalEl.innerText = subtotal + ' EG';
  if (discountRow) discountRow.style.display = discount > 0 ? 'flex' : 'none';
  if (discountEl) discountEl.innerText = '-' + discount + ' EG';
  if (totalEl) totalEl.innerText = total + ' EG';
}

function goToCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  
  const checkoutItems = document.getElementById('checkout-items');
  const customerName = document.getElementById('customer-name');
  const customerAddr = document.getElementById('customer-address');
  const customerPhone = document.getElementById('customer-phone');
  
  if (!checkoutItems) return;
  
  checkoutItems.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <img src="${item.img}" alt="${item.name}"/>
      <div>
        <p>${item.name}</p>
        <p style="color:var(--accent);font-weight:600;">${item.price} EG</p>
      </div>
    </div>
  `).join('');
  
  updateCheckoutTotal();
  
  if (currentUser) {
    if (customerName) customerName.value = currentUser.name || '';
    if (customerAddr) customerAddr.value = currentUser.address || '';
    if (customerPhone) customerPhone.value = currentUser.phone || '';
  }
  
  closeCart();
  showPage('checkout');
}

function goBack() {
  showPage('main');
}

async function submitOrder() {
  const nameEl = document.getElementById('customer-name');
  const phoneEl = document.getElementById('customer-phone');
  const addressEl = document.getElementById('customer-address');
  const notesEl = document.getElementById('customer-notes');
  
  const name = nameEl ? nameEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';
  const address = addressEl ? addressEl.value.trim() : '';
  const notes = notesEl ? notesEl.value.trim() : '';
  
  if (!name || !phone || !address) {
    showToast('Please fill all required fields', 'error');
    return;
  }
  
  if (!currentUser) {
    showToast('Please login first', 'error');
    openAuth();
    return;
  }
  
  if (cart.length === 0) {
    showToast('Your cart is empty', 'error');
    return;
  }
  
  const items = cart.map(item => ({
    name: item.name,
    price: parseInt(item.price),
    quantity: item.quantity || 1,
    image: item.img
  }));
  
  try {
    const data = await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items,
        shippingInfo: { fullName: name, phone, address, notes },
        paymentMethod: selectedPayment,
        promoCode: appliedPromo?.code
      })
    });
    
    cart = [];
    updateCart();
    appliedPromo = null;
    
    const successMsg = document.getElementById('success-message');
    const trackingMsg = document.getElementById('success-tracking');
    if (successMsg && data.order) {
      successMsg.innerText = `Order #${data.order.orderNumber || 'N/A'} confirmed! We will contact you soon.`;
    }
    if (trackingMsg && data.order?.trackingNumber) {
      trackingMsg.innerText = `Tracking Number: ${data.order.trackingNumber}`;
    }
    showPage('success');
    
  } catch (e) {
    showToast('Failed to place order: ' + e.message, 'error');
  }
}

/* ═══════════════════════════════════════════
   TRACKING
   ═══════════════════════════════════════════ */
async function trackOrder() {
  const trackingNum = document.getElementById('tracking-number')?.value.trim();
  const resultEl = document.getElementById('tracking-result');
  
  if (!trackingNum) {
    showToast('Please enter tracking number', 'error');
    return;
  }
  
  try {
    const data = await apiRequest('/orders');
    const order = data.orders?.find(o => o.trackingNumber === trackingNum);
    
    if (!order) {
      resultEl.innerHTML = '<p style="color:var(--error);">Order not found. Please check your tracking number.</p>';
      return;
    }
    
    const stages = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStage = stages.indexOf(order.status);
    
    resultEl.innerHTML = `
      <div style="background:var(--bg-card);border-radius:12px;padding:24px;border:1px solid var(--border-color);margin-top:20px;">
        <h3 style="margin-bottom:16px;">Order #${order.id}</h3>
        <div class="tracking-timeline">
          ${stages.map((stage, idx) => `
            <div class="tracking-step ${idx < currentStage ? 'completed' : ''} ${idx === currentStage ? 'active' : ''}">
              <div class="step-circle">${idx < currentStage ? '✓' : idx === currentStage ? '●' : '○'}</div>
              <span>${stage.charAt(0).toUpperCase() + stage.slice(1)}</span>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border-color);">
          <p><strong>Items:</strong> ${order.items.map(i => i.name).join(', ')}</p>
          <p><strong>Total:</strong> ${order.totalAmount} EG</p>
          <p><strong>Status:</strong> <span class="abadge abadge-${order.status}">${order.status}</span></p>
        </div>
      </div>
    `;
  } catch (e) {
    resultEl.innerHTML = '<p style="color:var(--error);">Failed to track order. Please try again.</p>';
  }
}

/* ═══════════════════════════════════════════
   THUMBNAILS
   ═══════════════════════════════════════════ */
function changeMainImg(productId, thumbEl) {
  const imgEl = document.getElementById('img-' + productId);
  if (!imgEl || !thumbEl) return;
  imgEl.classList.add('fade');
  setTimeout(() => {
    imgEl.src = thumbEl.src;
    imgEl.classList.remove('fade');
  }, 200);
  const card = thumbEl.closest('.nc-card');
  if (card) {
    card.querySelectorAll('.nc-thumb').forEach(t => t.classList.remove('active'));
  }
  thumbEl.classList.add('active');
}

/* ═══════════════════════════════════════════
   VISA FORMAT
   ═══════════════════════════════════════════ */
function formatCard(input) {
  if (!input) return;
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(input) {
  if (!input) return;
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2);
  input.value = v;
}

/* ═══════════════════════════════════════════
   NEWSLETTER
   ═══════════════════════════════════════════ */
function subscribeNewsletter() {
  const email = document.getElementById('newsletter-email')?.value.trim();
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email', 'error');
    return;
  }
  showToast('Subscribed successfully! 🎉', 'success');
  document.getElementById('newsletter-email').value = '';
}

/* ═══════════════════════════════════════════
   ADMIN
   ═══════════════════════════════════════════ */
const ADMIN_EMAIL = 'admin@haj.com';
const ADMIN_PASSWORD = 'admin123';
let isAdminLoggedIn = false;

function showAdminPage() {
  const pages = ['main-page','checkout-page','new-collection-page','account-page','success-page','admin-page'];
  pages.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  
  closeCart();
  closeAuth();
  
  const adminPage = document.getElementById('admin-page');
  if (adminPage) adminPage.style.display = 'block';
  
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken === 'admin_session_2025') {
    showAdminDashboard();
  } else {
    showAdminLogin();
  }
  window.scrollTo(0,0);
}

function showAdminLogin() {
  const loginScreen = document.getElementById('admin-login-screen');
  const dashboard = document.getElementById('admin-dashboard');
  if (loginScreen) loginScreen.style.display = 'flex';
  if (dashboard) dashboard.style.display = 'none';
}

function showAdminDashboard() {
  const loginScreen = document.getElementById('admin-login-screen');
  const dashboard = document.getElementById('admin-dashboard');
  if (loginScreen) loginScreen.style.display = 'none';
  if (dashboard) dashboard.style.display = 'block';
  loadAdminData();
}

function adminLogin() {
  const email = document.getElementById('admin-email')?.value.trim();
  const password = document.getElementById('admin-password')?.value;
  const errorEl = document.getElementById('admin-login-error');
  
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem('adminToken', 'admin_session_2025');
    isAdminLoggedIn = true;
    if (errorEl) errorEl.innerText = '';
    showAdminDashboard();
  } else {
    if (errorEl) errorEl.innerText = '❌ Wrong email or password';
  }
}

function adminLogout() {
  localStorage.removeItem('adminToken');
  isAdminLoggedIn = false;
  showAdminLogin();
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-panel').forEach(panel => panel.classList.remove('active'));
  
  event.target.classList.add('active');
  const panel = document.getElementById('tab-' + tab);
  if (panel) panel.classList.add('active');
  
  if (tab === 'products') renderAdminProductsList();
}

async function loadAdminData() {
  try {
    const statsData = await apiRequest('/admin/stats');
    if (statsData.stats) {
      document.getElementById('stat-revenue').innerText = statsData.stats.totalRevenue + ' EG';
      document.getElementById('stat-orders').innerText = statsData.stats.totalOrders;
      document.getElementById('stat-users').innerText = statsData.stats.totalUsers;
      document.getElementById('stat-pending').innerText = statsData.stats.pendingOrders;
    }
    
    const ordersData = await apiRequest('/admin/orders');
    renderAdminOrders(ordersData.orders || []);
    
    const usersData = await apiRequest('/admin/users');
    renderAdminUsers(usersData.users || []);
  } catch (e) {
    console.log('Admin API failed, showing demo data');
    showDemoAdminData();
  }
}

function showDemoAdminData() {
  document.getElementById('stat-revenue').innerText = '0 EG';
  document.getElementById('stat-orders').innerText = '0';
  document.getElementById('stat-users').innerText = '2';
  document.getElementById('stat-pending').innerText = '0';
  
  document.getElementById('admin-orders-table').innerHTML = 
    '<div class="admin-empty"><p>📦</p><p>No orders yet</p></div>';
  
  document.getElementById('admin-users-table').innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Orders</th></tr></thead>
      <tbody>
        <tr><td>user_1</td><td>halaa</td><td>jg@gmail.com</td><td><span class="abadge abadge-user">user</span></td><td>0</td></tr>
        <tr><td>user_2</td><td>halaa</td><td>jgii@gmail.com</td><td><span class="abadge abadge-user">user</span></td><td>0</td></tr>
      </tbody>
    </table>
  `;
}

function renderAdminOrders(orders) {
  const container = document.getElementById('admin-orders-table');
  if (!orders || orders.length === 0) {
    container.innerHTML = '<div class="admin-empty"><p>📦</p><p>No orders yet</p></div>';
    return;
  }
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>${o.customerName || 'N/A'}</td>
            <td>${o.items ? o.items.map(i => i.name).join(', ') : ''}</td>
            <td>${o.totalAmount || 0} EG</td>
            <td><span class="abadge abadge-${o.status || 'pending'}">${o.status || 'pending'}</span></td>
            <td>${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</td>
            <td>
              <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
                <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderAdminUsers(users) {
  const container = document.getElementById('admin-users-table');
  if (!users || users.length === 0) {
    container.innerHTML = '<div class="admin-empty"><p>👤</p><p>No users found</p></div>';
    return;
  }
  
  container.innerHTML = `
    <table>
      <thead>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Orders</th><th>Joined</th></tr>
      </thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td><span class="abadge abadge-${u.role || 'user'}">${u.role || 'user'}</span></td>
            <td>${u.ordersCount || 0}</td>
            <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function updateOrderStatus(orderId, status) {
  try {
    await apiRequest(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    showToast('✅ Order status updated to: ' + status, 'success');
    loadAdminData();
  } catch (e) {
    showToast('❌ Failed to update status: ' + e.message, 'error');
  }
}

/* ═══════════════════════════════════════════
   ADMIN PRODUCTS
   ═══════════════════════════════════════════ */
let productImages = [];

function handleProductImages(input) {
  const files = Array.from(input.files);
  processProductImageFiles(files);
  input.value = '';
}

function processProductImageFiles(files) {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      productImages.push(e.target.result);
      renderProductPreviews();
    };
    reader.readAsDataURL(file);
  });
}

function renderProductPreviews() {
  const container = document.getElementById('prod-img-previews');
  if (!container) return;
  container.innerHTML = productImages.map((src, i) => `
    <div class="prod-preview-wrap ${i === 0 ? 'first-badge' : ''}">
      <img src="${src}" alt="preview ${i+1}"/>
      <button class="prod-preview-remove" onclick="removeProductImage(${i})">✕</button>
    </div>
  `).join('');
}

function removeProductImage(index) {
  productImages.splice(index, 1);
  renderProductPreviews();
}

function addProduct() {
  const nameEl = document.getElementById('prod-name');
  const priceEl = document.getElementById('prod-price');
  const errEl = document.getElementById('prod-form-error');
  
  const name = nameEl ? nameEl.value.trim() : '';
  const price = priceEl ? priceEl.value.trim() : '';
  
  if (!name) { if (errEl) errEl.innerText = '❌ Please enter a product name.'; return; }
  if (!price || isNaN(price) || Number(price) <= 0) { if (errEl) errEl.innerText = '❌ Please enter a valid price.'; return; }
  if (productImages.length === 0) { if (errEl) errEl.innerText = '❌ Please add at least one image.'; return; }
  if (errEl) errEl.innerText = '';
  
  // Add to local products for demo
  const newProduct = {
    id: Date.now(),
    name,
    price: Number(price),
    imgs: [...productImages],
    rating: 0,
    reviews: 0,
    bestseller: false
  };
  allProducts.push(newProduct);
  
  if (nameEl) nameEl.value = '';
  if (priceEl) priceEl.value = '';
  productImages = [];
  renderProductPreviews();
  renderAdminProductsList();
  
  showToast('✅ Product added!', 'success');
}

function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  allProducts = allProducts.filter(p => p.id !== id);
  renderAdminProductsList();
  showToast('Product deleted', 'info');
}

function renderAdminProductsList() {
  const container = document.getElementById('admin-products-list');
  const countEl = document.getElementById('products-count');
  if (!container) return;
  
  const products = allProducts;
  if (countEl) countEl.innerText = products.length + ' product(s)';
  
  if (products.length === 0) {
    container.innerHTML = '<div class="admin-empty"><p>🛍️</p><p>No products yet. Add your first product above!</p></div>';
    return;
  }
  
  container.innerHTML = `<div class="admin-products-grid">
    ${products.map(p => `
      <div class="admin-product-card">
        <img class="admin-product-card-img" src="${p.imgs[0]}" alt="${p.name}"/>
        <div class="admin-product-card-body">
          <p class="admin-product-card-name">${p.name}</p>
          <p class="admin-product-card-price">${p.price} EG</p>
          <p class="admin-product-card-imgs">📸 ${p.imgs.length} image(s)</p>
          <button class="admin-product-delete-btn" onclick="deleteProduct(${p.id})">🗑️ Delete</button>
        </div>
      </div>
    `).join('')}
  </div>`;
}

/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadProducts();
  checkAuth();
  
  // Setup drag & drop for product images
  const dropArea = document.getElementById('prod-img-drop');
  if (dropArea) {
    ['dragenter','dragover'].forEach(e => {
      dropArea.addEventListener(e, ev => { ev.preventDefault(); dropArea.classList.add('drag-over'); });
    });
    ['dragleave','drop'].forEach(e => {
      dropArea.addEventListener(e, ev => { ev.preventDefault(); dropArea.classList.remove('drag-over'); });
    });
    dropArea.addEventListener('drop', ev => {
      const files = Array.from(ev.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      processProductImageFiles(files);
    });
  }
});