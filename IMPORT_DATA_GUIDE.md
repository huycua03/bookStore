# 📦 Import Sample Data Guide

## Overview
The `data.json` file contains sample data for all collections in your Book Store application.

---

## 📊 What's Included

### Collections:
1. **Categories** (5 items)
   - Văn học Việt Nam
   - Văn học thiếu nhi
   - Kỹ năng sống
   - Tiểu thuyết
   - Văn học hiện đại

2. **Customers** (4 items)
   - **Admin User** (`admin@bookstore.com`) - ⚠️ Password: `admin123`
   - Nguyễn Văn An
   - Trần Thị Bình
   - Lê Minh Châu

3. **Books** (15 items)
   - Various Vietnamese books with proper categories
   - Stock levels from 50 to 150
   - Prices from 60,000đ to 150,000đ

4. **Orders** (4 items)
   - Various order statuses (Pending, Processing, Shipped, Delivered)
   - Different customers and items

5. **Carts** (2 items)
   - Active carts for 2 customers

---

## 🚀 Method 1: Using MongoDB Compass (Recommended for Beginners)

### Step 1: Open MongoDB Compass
1. Launch MongoDB Compass
2. Connect to your database (usually `mongodb://localhost:27017`)

### Step 2: Import Each Collection

**For Categories:**
1. Select database: `bookstore`
2. Create collection: `categories` (if not exists)
3. Click "Add Data" → "Import JSON or CSV file"
4. You'll need to extract categories data from `data.json` first

**Note:** MongoDB Compass imports one collection at a time, so you'll need to separate the data.

---

## 🚀 Method 2: Using mongoimport (Command Line)

This method requires separating the data into individual files first.

### Step 1: Create Separate Files
Run the provided script (see below) or manually create:
- `categories.json`
- `customers.json`
- `books.json`
- `orders.json`
- `carts.json`

### Step 2: Import Using mongoimport

```bash
# Import categories
mongoimport --db bookstore --collection categories --file categories.json --jsonArray

# Import customers
mongoimport --db bookstore --collection customers --file customers.json --jsonArray

# Import books
mongoimport --db bookstore --collection books --file books.json --jsonArray

# Import orders
mongoimport --db bookstore --collection orders --file orders.json --jsonArray

# Import carts
mongoimport --db bookstore --collection carts --file carts.json --jsonArray
```

---

## 🚀 Method 3: Using Node.js Script (Easiest!)

### Step 1: Create Import Script

Save this as `import-data.js` in your Backend folder:

```javascript
import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const importData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MongoDBURI || 'mongodb://localhost:27017/bookstore');
    console.log('✅ Connected to MongoDB');

    // Read data file
    const data = JSON.parse(fs.readFileSync('../data.json', 'utf-8'));

    // Get collections
    const db = mongoose.connection.db;

    // Import categories
    if (data.categories && data.categories.length > 0) {
      await db.collection('categories').deleteMany({});
      await db.collection('categories').insertMany(
        data.categories.map(item => ({
          ...item,
          _id: new mongoose.Types.ObjectId(item._id.$oid),
          createdAt: new Date(item.createdAt.$date),
          updatedAt: new Date(item.updatedAt.$date)
        }))
      );
      console.log(`✅ Imported ${data.categories.length} categories`);
    }

    // Import customers
    if (data.customers && data.customers.length > 0) {
      await db.collection('customers').deleteMany({});
      await db.collection('customers').insertMany(
        data.customers.map(item => ({
          ...item,
          _id: new mongoose.Types.ObjectId(item._id.$oid),
          createdAt: new Date(item.createdAt.$date),
          updatedAt: new Date(item.updatedAt.$date)
        }))
      );
      console.log(`✅ Imported ${data.customers.length} customers`);
    }

    // Import books
    if (data.books && data.books.length > 0) {
      await db.collection('books').deleteMany({});
      await db.collection('books').insertMany(
        data.books.map(item => ({
          ...item,
          _id: new mongoose.Types.ObjectId(item._id.$oid),
          category: new mongoose.Types.ObjectId(item.category.$oid)
        }))
      );
      console.log(`✅ Imported ${data.books.length} books`);
    }

    // Import orders
    if (data.orders && data.orders.length > 0) {
      await db.collection('orders').deleteMany({});
      await db.collection('orders').insertMany(
        data.orders.map(item => ({
          ...item,
          _id: new mongoose.Types.ObjectId(item._id.$oid),
          orderDate: new Date(item.orderDate.$date)
        }))
      );
      console.log(`✅ Imported ${data.orders.length} orders`);
    }

    // Import carts
    if (data.carts && data.carts.length > 0) {
      await db.collection('carts').deleteMany({});
      await db.collection('carts').insertMany(
        data.carts.map(item => ({
          ...item,
          _id: new mongoose.Types.ObjectId(item._id.$oid),
          customer: new mongoose.Types.ObjectId(item.customer.$oid),
          items: item.items.map(cartItem => ({
            ...cartItem,
            book: new mongoose.Types.ObjectId(cartItem.book.$oid)
          })),
          createdAt: new Date(item.createdAt.$date),
          updatedAt: new Date(item.updatedAt.$date)
        }))
      );
      console.log(`✅ Imported ${data.carts.length} carts`);
    }

    console.log('\n🎉 All data imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

importData();
```

### Step 2: Run the Script

```bash
cd Backend
node import-data.js
```

---

## 🚀 Method 4: Using MongoDB Shell (mongosh)

```javascript
// Connect to your database
use bookstore

// Clear existing data (optional)
db.categories.deleteMany({})
db.customers.deleteMany({})
db.books.deleteMany({})
db.orders.deleteMany({})
db.carts.deleteMany({})

// You'll need to manually copy-paste each collection's data
// This method is tedious, use Method 3 instead!
```

---

## ⚠️ Important Notes

### Password for Customers
All customer passwords in the sample data are set to: **`admin123`**

The hash in the data is a placeholder. To use actual working passwords, you need to:

**Option 1:** Let users signup through the app (recommended)

**Option 2:** Update passwords using bcrypt:
```javascript
import bcryptjs from 'bcryptjs';

// In your import script, hash the password
const hashedPassword = await bcryptjs.hash('admin123', 10);
```

### Admin User
- **Email:** `admin@bookstore.com`
- **Password:** `admin123` (you need to hash this properly)
- **isAdmin:** `true`

### Image Files
The books reference image files that should be in `Backend/public/images/`:
- Make sure you have the actual image files
- Or update the `image` field to point to your images

---

## ✅ Verify Import

After importing, verify the data:

### Using MongoDB Compass:
1. Refresh the collections
2. Check each collection has data

### Using mongosh:
```javascript
use bookstore

// Check counts
db.categories.countDocuments()  // Should be 5
db.customers.countDocuments()   // Should be 4
db.books.countDocuments()       // Should be 15
db.orders.countDocuments()      // Should be 4
db.carts.countDocuments()       // Should be 2

// Check admin user exists
db.customers.findOne({ isAdmin: true })
```

### Using Your App:
1. Start backend: `npm start`
2. Visit: `http://localhost:4001/api/category`
3. Should see 5 categories
4. Visit: `http://localhost:4001/api/book`
5. Should see 15 books

---

## 🔄 Re-import Data

If you need to import again:

1. **Drop database:**
   ```javascript
   use bookstore
   db.dropDatabase()
   ```

2. **Re-run import script**

Or just delete specific collections:
```javascript
db.categories.deleteMany({})
db.customers.deleteMany({})
// etc...
```

---

## 🐛 Troubleshooting

### "Duplicate key error"
- You're trying to import data that already exists
- Solution: Clear the collection first or use a different database

### "Invalid ObjectId"
- Check that ObjectIds are in correct format
- Use Method 3 (Node.js script) which handles this automatically

### "Cannot find module"
- Make sure you're in the Backend directory
- Check that all dependencies are installed

### "Connection refused"
- Make sure MongoDB is running
- Check connection string in .env file

---

## 🎯 Quick Start (Recommended Path)

1. **Use Method 3 (Node.js Script)**
2. Create `import-data.js` in Backend folder
3. Run: `node import-data.js`
4. Verify data was imported
5. Update admin password properly (see note above)
6. Start your app and test!

---

## 📝 Next Steps After Import

1. **Fix Admin Password:**
   - Login won't work until you hash the password properly
   - Use signup to create new admin, then set `isAdmin: true` manually
   - Or run a script to update the password hash

2. **Add Image Files:**
   - Copy actual images to `Backend/public/images/`
   - Or update book records with your image URLs

3. **Test the App:**
   - Try logging in
   - Browse books
   - Test cart functionality
   - Place an order

---

## 💡 Tips

- Keep `data.json` as a backup
- You can customize the data before importing
- Add more books, customers, or orders as needed
- Use this as a template for your own data

---

**Need Help?** Check the error messages carefully - they usually indicate exactly what's wrong!








