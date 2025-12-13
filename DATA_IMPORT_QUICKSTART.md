# 🚀 Quick Start - Import Sample Data

## ⚡ Super Fast Method (3 Steps)

### 1️⃣ Navigate to Backend
```bash
cd Backend
```

### 2️⃣ Run Import Script
```bash
npm run import
```

### 3️⃣ Done! 🎉
Your database now has:
- ✅ 5 Categories
- ✅ 4 Customers (including 1 admin)
- ✅ 15 Books
- ✅ 4 Sample Orders
- ✅ 2 Active Carts

---

## 👤 Login Credentials

### Admin Account:
- **Email:** `admin@bookstore.com`
- **Password:** `admin123`
- **Access:** Full admin panel

### Regular Users:
All have password: `admin123`
- `nguyen.van.an@example.com`
- `tran.thi.binh@example.com`
- `le.minh.chau@example.com`

---

## 🗑️ Clear All Data

If you want to start fresh:

```bash
cd Backend
npm run clear
```

This will ask for confirmation before deleting all data.

---

## 📋 What Gets Imported

### Categories (5):
1. Văn học Việt Nam
2. Văn học thiếu nhi
3. Kỹ năng sống
4. Tiểu thuyết
5. Văn học hiện đại

### Books (15):
- Đắc Nhân Tâm - 150,000đ
- Mắt Biếc - 110,000đ
- Tôi Thấy Hoa Vàng Trên Cỏ Xanh - 95,000đ
- Nhà Giả Kim - 125,000đ
- Dế Mèn Phiêu Lưu Ký - 60,000đ
- And 10 more...

### Orders (4):
- Various statuses: Pending, Processing, Shipped, Delivered
- Different customers and items
- Total values from 125,000đ to 410,000đ

---

## ✅ Verify Import

### Check in MongoDB Compass:
1. Open MongoDB Compass
2. Connect to `bookstore` database
3. You should see 5 collections with data

### Check via API:
```bash
# Make sure backend is running first
npm start

# Then in another terminal or browser:
curl http://localhost:4001/api/category
curl http://localhost:4001/api/book
```

### Check in App:
1. Start backend: `npm start` (in Backend folder)
2. Start frontend: `npm run dev` (in Frontend folder)
3. Open: http://localhost:5173
4. You should see 15 books on the homepage

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Start MongoDB first
mongod
```

### "Cannot find module"
```bash
# Make sure you're in Backend folder
cd Backend

# Install dependencies if needed
npm install
```

### "Data already exists"
```bash
# Clear existing data first
npm run clear

# Then import again
npm run import
```

---

## 📝 Available Commands

```bash
# Import sample data
npm run import

# Clear all data
npm run clear

# Start backend server
npm start
```

---

## 🎯 Next Steps After Import

1. **Start Backend:**
   ```bash
   cd Backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Login as Admin:**
   - Go to http://localhost:5173
   - Click "Login"
   - Email: `admin@bookstore.com`
   - Password: `admin123`

4. **Access Admin Panel:**
   - After login, go to: http://localhost:5173/admin/books
   - You should see the admin dashboard

5. **Test Features:**
   - Browse books
   - Add to cart
   - Place an order
   - Manage books (as admin)

---

## 💡 Pro Tips

- **Keep data.json as backup** - You can always re-import
- **Customize before import** - Edit data.json to add your own data
- **Use clear + import** - To reset database to initial state
- **Check logs** - Import script shows detailed progress

---

## 📚 Full Documentation

For detailed information, see:
- `IMPORT_DATA_GUIDE.md` - Complete import guide
- `data.json` - The actual data file
- `Backend/import-data.js` - Import script
- `Backend/clear-data.js` - Clear script

---

## 🎉 That's It!

You now have a fully populated Book Store database ready to use!

**Questions?** Check the error messages - they're usually very clear about what's wrong.

---

**Made with ❤️ to make your life easier!**








