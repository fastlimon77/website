require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Papkalarni tekshirish
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Statik fayllar
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Fayl yuklash (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Faqat rasm fayllari (JPG, PNG, WEBP) ruxsat etiladi'));
  }
});

// Standart ma'lumotlar bazasi
const defaultMenu = [
  { id: 1, name: "Limon Signature Burger", category: "Burgerlar", price: 36000, desc: "Yumshoq bulochka, 100% mol go'shti kotleti, cheddar pishloqi va maxsus limonli sous.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Double Cheese Burger", category: "Burgerlar", price: 45000, desc: "Ikki qavatli shirador mol go'shti, qo'shaloq cheddar, tuzlangan bodring va sous.", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Crispy Chicken Burger", category: "Burgerlar", price: 32000, desc: "Qarsildoq tovuq filesi, aysberg salati, pomidor va qaymoqli sarimsoq sousi.", image: "https://images.unsplash.com/photo-1615297928064-24977384d0da?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Standart Mol Go'shtli Lavash", category: "Lavashlar", price: 34000, desc: "Yupqa lavash xamiri, qovurilgan mol go'shti, chips, pomidor, bodring va oq sous.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80" },
  { id: 5, name: "Pishloqli Tovuq Lavash", category: "Lavashlar", price: 33000, desc: "Shirador tovuq go'shti, eritilgan cheddar pishloqi, yangi sabzavotlar va maxsus sous.", image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80" },
  { id: 6, name: "Limon Hot-Dog XL", category: "Hot-Dog", price: 22000, desc: "Uzun bulochka, ikki dona dudlangan sosiska, koreys sabzisi, xantal va ketchup.", image: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80" },
  { id: 7, name: "Pepperoni Pitsa (30 sm)", category: "Pitsa", price: 68000, desc: "Klassik italyan xamiri, motsarella pishloqi, halol pepperoni kolbasasi va tomat sousi.", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80" },
  { id: 8, name: "Kombo Mix Pitsa (30 sm)", category: "Pitsa", price: 74000, desc: "Mol go'shti, tovuq filesi, qo'ziqorin, bulg'or qalampiri, zaytun va motsarella.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80" },
  { id: 9, name: "Kartoshka Fri (Katta)", category: "Sneklar", price: 16000, desc: "Oltin rangda qovurilgan qarsildoq kartoshka fri, dengiz tuzi bilan.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80" },
  { id: 10, name: "Tovuq Naggetslari (9 dona)", category: "Sneklar", price: 26000, desc: "Tashqarisi qarsildoq, ichi yumshoq tovuq bo'lakchalari.", image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80" },
  { id: 11, name: "Limonad Fresh (0.5L)", category: "Ichimliklar", price: 15000, desc: "Yangi siqilgan limon sharbati, yalpiz barglari va muzdek gazlangan suv.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80" },
  { id: 12, name: "Coca-Cola (0.5L)", category: "Ichimliklar", price: 10000, desc: "Muzdek klassik Coca-Cola ichimligi.", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80" }
];

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      menu: defaultMenu,
      customers: [],
      orders: [],
      settings: {
        adminPin: process.env.ADMIN_PIN || "1234",
        deliveryFee: 12000,
        cardNumber: "8600 0609 1234 5678",
        cardHolder: "LIMON FAST FOOD",
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
        telegramChatId: process.env.TELEGRAM_CHAT_ID || ""
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.settings) data.settings = {};
    if (process.env.TELEGRAM_BOT_TOKEN && !data.settings.telegramBotToken) {
      data.settings.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    }
    if (process.env.TELEGRAM_CHAT_ID && !data.settings.telegramChatId) {
      data.settings.telegramChatId = process.env.TELEGRAM_CHAT_ID;
    }
    return data;
  } catch (err) {
    console.error("DB o'qishda xatolik:", err);
    return { menu: defaultMenu, customers: [], orders: [], settings: { adminPin: "1234", deliveryFee: 12000, cardNumber: "8600 0609 1234 5678", cardHolder: "LIMON FAST FOOD", telegramBotToken: "", telegramChatId: "" } };
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Admin PIN tekshirish middleware
function requireAdmin(req, res, next) {
  const db = loadDB();
  const pin = req.headers['x-admin-pin'];
  if (!pin || pin !== String(db.settings.adminPin || "1234")) {
    return res.status(401).json({ error: "Admin PIN kodi noto'g'ri" });
  }
  next();
}

// Telegramga buyurtma yuborish (matn + rasm skrinshot)
async function sendOrderToTelegram(order, settings) {
  const token = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { sent: false, reason: "Telegram Bot Token yoki Chat ID kiritilmagan" };
  }

  const itemsText = order.items
    .map((it, idx) => `${idx + 1}. ${it.name} x ${it.qty} = ${(it.price * it.qty).toLocaleString('uz-UZ')} so'm`)
    .join('\n');

  const deliveryLabel = order.deliveryType === 'delivery' ? 'Yetkazib berish' : 'Olib ketish (Soboy)';
  const paymentLabel = order.paymentMethod === 'cash'
    ? 'Naqd pul'
    : `Karta orqali (${order.paymentProvider || 'Karta'})`;

  let addressBlock = 'Filialdan olib ketish';
  if (order.deliveryType === 'delivery') {
    addressBlock = order.addressText || 'Belgilanmagan';
    if (order.location && order.location.lat && order.location.lng) {
      addressBlock += `\nXarita: https://maps.google.com/?q=${order.location.lat},${order.location.lng}`;
    }
  }

  const message = [
    `<b>YANGI BUYURTMA #${order.orderNumber}</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `<b>Mijoz:</b> ${order.customerName}`,
    `<b>Telefon:</b> ${order.customerPhone}`,
    `<b>Xizmat turi:</b> ${deliveryLabel}`,
    `<b>To'lov:</b> ${paymentLabel}`,
    `<b>Manzil:</b> ${addressBlock}`,
    order.comment ? `<b>Izoh:</b> ${order.comment}` : null,
    `━━━━━━━━━━━━━━━━━━`,
    `<b>Mahsulotlar:</b>`,
    itemsText,
    `━━━━━━━━━━━━━━━━━━`,
    order.deliveryFee > 0 ? `<b>Yetkazib berish:</b> ${order.deliveryFee.toLocaleString('uz-UZ')} so'm` : null,
    `<b>JAMI TO'LOV:</b> ${order.total.toLocaleString('uz-UZ')} so'm`,
    `<b>Vaqt:</b> ${new Date(order.createdAt).toLocaleString('uz-UZ')}`
  ].filter(Boolean).join('\n');

  try {
    // 1. Asosiy matnni yuborish
    const msgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });
    const msgData = await msgRes.json();

    // 2. Agar xarita koordinatasi bo'lsa, Telegram Location yuborish
    if (order.deliveryType === 'delivery' && order.location && order.location.lat && order.location.lng) {
      await fetch(`https://api.telegram.org/bot${token}/sendLocation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          latitude: Number(order.location.lat),
          longitude: Number(order.location.lng)
        })
      }).catch(() => {});
    }

    // 3. Agar to'lov skrinshoti yuklangan bo'lsa, sendPhoto orqali yuborish
    if (order.paymentScreenshotPath && fs.existsSync(order.paymentScreenshotPath)) {
      const fileBuffer = fs.readFileSync(order.paymentScreenshotPath);
      const blob = new Blob([fileBuffer]);
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('caption', `Buyurtma #${order.orderNumber} to'lov cheki (${order.customerPhone})`);
      formData.append('photo', blob, path.basename(order.paymentScreenshotPath));

      await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        body: formData
      }).catch((err) => console.error("Telegram photo xatolik:", err));
    }

    return { sent: Boolean(msgData.ok), telegramResponse: msgData };
  } catch (err) {
    console.error("Telegram yuborishda xatolik:", err);
    return { sent: false, reason: err.message };
  }
}

// ==================== API ROUTES ====================

// Ommaviy sozlamalar (tokendan tashqari)
app.get('/api/public-config', (req, res) => {
  const db = loadDB();
  res.json({
    deliveryFee: db.settings.deliveryFee ?? 12000,
    cardNumber: db.settings.cardNumber || "8600 0609 1234 5678",
    cardHolder: db.settings.cardHolder || "LIMON FAST FOOD"
  });
});

// Menyu olish
app.get('/api/menu', (req, res) => {
  const db = loadDB();
  res.json(db.menu);
});

// Admin: Mahsulot qo'shish (fayl yoki rasm URL bilan)
app.post('/api/menu', requireAdmin, upload.single('imageFile'), (req, res) => {
  const db = loadDB();
  const { name, category, price, desc, imageUrl } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ error: "Nomi, kategoriya va narx majburiy" });
  }
  const image = req.file ? `/uploads/${req.file.filename}` : (imageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80");
  const nextId = db.menu.length ? Math.max(...db.menu.map(m => m.id)) + 1 : 1;
  const newItem = {
    id: nextId,
    name: String(name).trim(),
    category: String(category).trim(),
    price: Number(price),
    desc: String(desc || '').trim(),
    image
  };
  db.menu.unshift(newItem);
  saveDB(db);
  res.status(201).json(newItem);
});

// Admin: Mahsulotni tahrirlash (narx, nom, rasm)
app.put('/api/menu/:id', requireAdmin, upload.single('imageFile'), (req, res) => {
  const db = loadDB();
  const id = Number(req.params.id);
  const idx = db.menu.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Mahsulot topilmadi" });

  const current = db.menu[idx];
  const { name, category, price, desc, imageUrl } = req.body;
  let image = current.image;
  if (req.file) image = `/uploads/${req.file.filename}`;
  else if (imageUrl && imageUrl.trim()) image = imageUrl.trim();

  db.menu[idx] = {
    ...current,
    name: name !== undefined ? String(name).trim() : current.name,
    category: category !== undefined ? String(category).trim() : current.category,
    price: price !== undefined ? Number(price) : current.price,
    desc: desc !== undefined ? String(desc).trim() : current.desc,
    image
  };
  saveDB(db);
  res.json(db.menu[idx]);
});

// Admin: Mahsulotni o'chirish
app.delete('/api/menu/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const id = Number(req.params.id);
  const idx = db.menu.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Mahsulot topilmadi" });
  db.menu.splice(idx, 1);
  saveDB(db);
  res.json({ deleted: true, id });
});

// Mijoz: Telefon raqam orqali ro'yxatdan o'tish / kirish
app.post('/api/auth/customer', (req, res) => {
  const db = loadDB();
  const { name, phone } = req.body;
  const cleanPhone = String(phone || '').replace(/[^\d+]/g, '');
  if (cleanPhone.length < 9) {
    return res.status(400).json({ error: "Telefon raqamini to'g'ri kiriting" });
  }
  let customer = db.customers.find(c => c.phone === cleanPhone);
  if (!customer) {
    customer = {
      id: Date.now(),
      name: String(name || 'Mijoz').trim(),
      phone: cleanPhone,
      createdAt: new Date().toISOString()
    };
    db.customers.push(customer);
    saveDB(db);
  } else if (name && String(name).trim()) {
    customer.name = String(name).trim();
    saveDB(db);
  }
  res.json(customer);
});

// Mijoz: Shaxsiy buyurtmalar tarixi
app.get('/api/orders/customer', (req, res) => {
  const db = loadDB();
  const cleanPhone = String(req.query.phone || '').replace(/[^\d+]/g, '');
  if (!cleanPhone) return res.json([]);
  const list = db.orders
    .filter(o => o.customerPhone === cleanPhone)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

// Buyurtma yaratish + skrinshot yuklash + Telegramga yuborish
app.post('/api/orders', upload.single('screenshot'), async (req, res) => {
  try {
    const db = loadDB();
    const {
      customerName,
      customerPhone,
      deliveryType,
      paymentMethod,
      paymentProvider,
      addressText,
      location,
      comment,
      items
    } = req.body;

    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    const parsedLocation = location ? (typeof location === 'string' ? JSON.parse(location) : location) : null;

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return res.status(400).json({ error: "Savatcha bo'sh" });
    }

    const cleanPhone = String(customerPhone || '').replace(/[^\d+]/g, '');
    if (cleanPhone.length < 9) {
      return res.status(400).json({ error: "Telefon raqami noto'g'ri" });
    }

    const subtotal = parsedItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
    const deliveryFee = deliveryType === 'delivery' ? Number(db.settings.deliveryFee ?? 12000) : 0;
    const total = subtotal + deliveryFee;

    const orderNumber = 1000 + db.orders.length + 1;
    const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const screenshotPath = req.file ? req.file.path : null;

    const order = {
      id: Date.now(),
      orderNumber,
      customerName: String(customerName || 'Mijoz').trim(),
      customerPhone: cleanPhone,
      deliveryType: deliveryType === 'pickup' ? 'pickup' : 'delivery',
      paymentMethod: paymentMethod === 'card' ? 'card' : 'cash',
      paymentProvider: paymentMethod === 'card' ? (paymentProvider || 'Karta') : null,
      paymentScreenshot: screenshotUrl,
      addressText: deliveryType === 'delivery' ? String(addressText || '').trim() : 'Olib ketish (Soboy)',
      location: parsedLocation,
      comment: String(comment || '').trim(),
      items: parsedItems,
      subtotal,
      deliveryFee,
      total,
      status: 'Yangi',
      createdAt: new Date().toISOString()
    };

    db.orders.unshift(order);
    saveDB(db);

    const tgResult = await sendOrderToTelegram({ ...order, paymentScreenshotPath: screenshotPath }, db.settings);
    res.status(201).json({ order, telegram: tgResult });
  } catch (err) {
    console.error("Buyurtma yaratishda xatolik:", err);
    res.status(500).json({ error: "Buyurtmani saqlashda xatolik yuz berdi" });
  }
});

// Admin: PIN tekshirish
app.post('/api/admin/verify', (req, res) => {
  const db = loadDB();
  const { pin } = req.body;
  if (String(pin) === String(db.settings.adminPin || "1234")) {
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "PIN kod noto'g'ri" });
});

// Admin: Barcha buyurtmalar
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.orders);
});

// Admin: Buyurtma holatini o'zgartirish
app.patch('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const db = loadDB();
  const id = Number(req.params.id);
  const { status } = req.body;
  const order = db.orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: "Buyurtma topilmadi" });
  order.status = status;
  saveDB(db);
  res.json(order);
});

// Admin: Sozlamalarni olish va saqlash
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.settings);
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const db = loadDB();
  const { deliveryFee, cardNumber, cardHolder, telegramBotToken, telegramChatId, adminPin } = req.body;
  if (deliveryFee !== undefined) db.settings.deliveryFee = Number(deliveryFee);
  if (cardNumber !== undefined) db.settings.cardNumber = String(cardNumber).trim();
  if (cardHolder !== undefined) db.settings.cardHolder = String(cardHolder).trim();
  if (telegramBotToken !== undefined) db.settings.telegramBotToken = String(telegramBotToken).trim();
  if (telegramChatId !== undefined) db.settings.telegramChatId = String(telegramChatId).trim();
  if (adminPin && String(adminPin).trim().length >= 4) db.settings.adminPin = String(adminPin).trim();
  saveDB(db);
  res.json(db.settings);
});

// Admin: Telegram ulanishini tekshirish
app.post('/api/admin/test-telegram', requireAdmin, async (req, res) => {
  const db = loadDB();
  const token = req.body.telegramBotToken || db.settings.telegramBotToken;
  const chatId = req.body.telegramChatId || db.settings.telegramChatId;
  if (!token || !chatId) {
    return res.status(400).json({ error: "Bot Token va Chat ID ni kiriting" });
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: "<b>LIMON FAST FOOD</b>: Telegram bot muvaffaqiyatli ulandi!",
        parse_mode: 'HTML'
      })
    });
    const data = await r.json();
    if (!data.ok) return res.status(400).json({ error: data.description || "Telegram xatoligi" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LIMON FAST FOOD serveri http://localhost:${PORT} portida ishga tushdi`);
});
