# LIMON FAST FOOD — Full-Stack Web App (Railway Ready)

Node.js + Express.js backend hamda zamonaviy responsive frontend bilan yaratilgan fast food buyurtma tizimi.

## Imkoniyatlar
- **Mijoz paneli:** Telefon raqam orqali ro'yxatdan o'tish va shaxsiy buyurtmalar tarixini kuzatish.
- **Savatcha va Checkout:** Yetkazib berish yoki Olib ketish (Soboy), Naqd yoki Karta (Click, Payme, Uzum Bank, Karta raqam), to'lov skrinshotini yuklash, so'zda yoki Leaflet xaritasi orqali manzil belgilash.
- **Admin Panel (Standart PIN: `1234`):** Mahsulot va rasm qo'shish/o'chirish, narxlarni tahrirlash, buyurtmalar holatini boshqarish, karta va yetkazib berish narxini sozlash.
- **Telegram Bot integratsiyasi:** Har bir yangi buyurtma (matn + xarita lokatsiyasi + to'lov skrinshoti) to'g'ridan-to'g'ri Telegram botga yuboriladi.

## Railwayga joylash (Deploy)
1. ZIP arxivni ochib, loyihani GitHub repositoryga yuklang.
2. Railway.app saytiga kiring -> **New Project** -> **Deploy from GitHub repo** ni tanlang.
3. **Variables** bo'limida (ixtiyoriy, Admin paneldan ham kiritish mumkin):
   - `ADMIN_PIN=1234`
   - `TELEGRAM_BOT_TOKEN=bot_tokeningiz`
   - `TELEGRAM_CHAT_ID=chat_yoki_guruh_id`
4. **Settings -> Networking -> Generate Domain** tugmasini bosing — sayt ishga tushadi.

## Lokal ishga tushirish
```bash
npm install
npm start
```
Brauzerda `http://localhost:3000` manzilini oching.
