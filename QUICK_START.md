# 🚀 Quick Start Guide - Book Store App

## Prerequisites
- Node.js (v14 or higher)
- MongoDB running locally or connection string
- Git

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Backend Setup

```bash
# Navigate to backend
cd Backend

# Install dependencies
npm install

# Create .env file
echo "PORT=4001
MongoDBURI=mongodb://localhost:27017/bookstore
JWT_SECRET=my_super_secret_jwt_key_12345
NODE_ENV=development" > .env

# Start backend
npm start
```

Backend should now be running on http://localhost:4001

---

### Step 2: Frontend Setup

```bash
# Open new terminal
# Navigate to frontend
cd Frontend

# Install dependencies (if not already done)
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:4001/api" > .env

# Start frontend
npm run dev
```

Frontend should now be running on http://localhost:5173

---

## 👤 Create Admin User

### Option 1: Using MongoDB Compass or mongosh

1. Open MongoDB
2. Navigate to `bookstore` database
3. Open `customers` collection
4. Find or create a user
5. Add/Update field: `isAdmin: true`

### Option 2: Using mongosh CLI

```bash
mongosh

use bookstore

# Update existing user
db.customers.updateOne(
  { email: "your_email@example.com" },
  { $set: { isAdmin: true } }
)

# Or create new admin user (after signup from UI)
```

---

## ✅ Verify Setup

### Test Regular User:
1. Go to http://localhost:5173
2. Click "Signup" and create account
3. Login with credentials
4. You should be able to:
   - Browse books
   - Add to cart
   - Checkout

### Test Admin User:
1. Login with admin account
2. Navigate to http://localhost:5173/admin/books
3. You should see admin panel

---

## 🎯 Key Features

### For Users:
- ✅ Browse books
- ✅ View book details
- ✅ Add to cart
- ✅ Place orders
- ✅ Dark/Light theme

### For Admins:
- ✅ Manage books (CRUD)
- ✅ Manage categories (CRUD)
- ✅ Manage customers (CRUD)
- ✅ View and update order status
- ✅ Upload book images

---

## 🔐 Default Ports

- Backend API: http://localhost:4001
- Frontend: http://localhost:5173
- MongoDB: mongodb://localhost:27017

---

## 📁 Key Files to Know

### Backend:
- `Backend/index.js` - Main server file
- `Backend/.env` - Environment variables
- `Backend/middleware/auth.js` - JWT authentication
- `Backend/public/images/` - Uploaded book images

### Frontend:
- `Frontend/src/config/api.js` - API configuration
- `Frontend/src/components/ProtectedRoute.jsx` - Route protection
- `Frontend/.env` - Environment variables

---

## 🐛 Common Issues

### Port Already in Use:
```bash
# Change PORT in Backend/.env
PORT=4002
```

### Cannot Connect to MongoDB:
- Ensure MongoDB is running
- Check MongoDBURI in Backend/.env

### CORS Error:
- Ensure both frontend and backend are running
- Check API URL in Frontend/.env

### Token Expired:
- Clear browser localStorage
- Login again

---

## 📝 API Endpoints

### Public:
- POST /api/signup
- POST /api/login
- GET /api/book
- GET /api/book/:id
- GET /api/category

### Protected (User):
- POST /api/order
- GET /api/cart
- POST /api/cart

### Protected (Admin Only):
- POST /api/book
- PUT /api/book/:id
- DELETE /api/book/:id
- GET /api/order
- GET /api/customer

---

## 🎨 Accessing Admin Panel

1. Ensure user has `isAdmin: true` in database
2. Login to the application
3. Navigate to: `http://localhost:5173/admin/books`

Or manually visit these URLs (if logged in as admin):
- `/admin/books` - Manage books
- `/admin/categories` - Manage categories
- `/admin/customers` - Manage customers
- `/admin/orders` - View orders

---

## 💡 Tips

1. **Reset Everything:**
   ```bash
   # Drop database in MongoDB
   mongosh
   use bookstore
   db.dropDatabase()
   ```

2. **Check Logs:**
   - Backend: Terminal where `npm start` is running
   - Frontend: Browser console (F12)

3. **Image Upload:**
   - Images are saved to `Backend/public/images/`
   - They're served at `/images/filename`

---

## 🎉 You're All Set!

Your Book Store application is now running with:
- ✅ JWT Authentication
- ✅ Protected Routes
- ✅ Admin Panel
- ✅ Cart System
- ✅ Order Management

For more details, see `IMPROVEMENTS.md`

---

**Need Help?** Check the browser console and backend terminal for error messages.








