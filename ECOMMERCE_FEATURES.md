# 🛍️ E-Commerce Features Documentation

## Overview
This document describes all the e-commerce features added to your Book Store application.

---

## ✨ **New Features**

### 1️⃣ **Search & Filter System** 🔍

**Frontend Component:** `Frontend/src/components/SearchBar.jsx`

**Features:**
- ✅ **Text Search** - Search books by title
- ✅ **Category Filter** - Filter by book category
- ✅ **Price Range Filter** - Filter by price ranges
- ✅ **Sorting Options**:
  - Price: Low to High
  - Price: High to Low
  - Name: A-Z
  - Name: Z-A
  - Newest first

**How to Use:**
1. Navigate to `/book` page
2. Use the search bar at the top
3. Select filters and click "Áp dụng bộ lọc"
4. Click "Đặt lại" to clear all filters

---

### 2️⃣ **Product Reviews & Ratings** ⭐

**Backend API:**
- POST `/api/review` - Create a review (Protected)
- GET `/api/review/book/:bookId` - Get all reviews for a book
- PUT `/api/review/:id` - Update your review (Protected)
- DELETE `/api/review/:id` - Delete your review (Protected)
- PUT `/api/review/:id/helpful` - Mark review as helpful

**Database Model:** `Backend/model/review.model.js`

**Features:**
- ✅ Users can rate books 1-5 stars
- ✅ Users can write text reviews
- ✅ Average rating calculation
- ✅ One review per user per book
- ✅ Mark reviews as helpful
- ✅ View all reviews with author info

**Request Example:**
```json
POST /api/review
{
  "bookId": "book_id_here",
  "rating": 5,
  "comment": "Excellent book!"
}
```

---

### 3️⃣ **Wishlist/Favorites** ❤️

**Frontend Pages:**
- `/wishlist` - View all wishlist items
- Component: `Frontend/src/components/Wishlist.jsx`

**Backend API:**
- GET `/api/wishlist` - Get user's wishlist (Protected)
- POST `/api/wishlist` - Add book to wishlist (Protected)
- DELETE `/api/wishlist/:bookId` - Remove from wishlist (Protected)
- DELETE `/api/wishlist` - Clear entire wishlist (Protected)
- GET `/api/wishlist/check/:bookId` - Check if book is in wishlist (Protected)

**Database Model:** `Backend/model/wishlist.model.js`

**Features:**
- ✅ Save favorite books for later
- ✅ Quick add to cart from wishlist
- ✅ Remove items from wishlist
- ✅ View count of wishlist items
- ✅ Beautiful empty state

**Usage:**
1. Login to your account
2. Click the heart icon in navbar to view wishlist
3. Add books from book detail pages
4. Quick add to cart from wishlist page

---

### 4️⃣ **User Order History** 📋

**Frontend Page:**
- `/order-history` - View all your orders
- Component: `Frontend/src/components/OrderHistory.jsx`

**Backend API:**
- GET `/api/order/my/list` - Get user's orders (Protected)

**Features:**
- ✅ View all past orders
- ✅ Order status tracking:
  - ⏳ Pending (Chờ xử lý)
  - 🔄 Processing (Đang xử lý)
  - 🚚 Shipped (Đang giao)
  - ✅ Delivered (Đã giao)
  - ❌ Cancelled (Đã hủy)
- ✅ Order details: items, quantities, prices
- ✅ Order date and time
- ✅ Delivery address
- ✅ Order notes

**Status Color Codes:**
- Yellow badge: Pending
- Blue badge: Processing
- Purple badge: Shipped
- Green badge: Delivered
- Red badge: Cancelled

---

### 5️⃣ **User Profile Management** 👤

**Frontend Page:**
- `/profile` - User profile page
- Component: `Frontend/src/components/UserProfile.jsx`

**Features:**
- ✅ View profile information
- ✅ Edit profile:
  - Full name
  - Phone number
  - Address
- ✅ Email is read-only
- ✅ Admin badge display
- ✅ Quick links to:
  - Order History
  - Wishlist
  - Shopping Cart

**How to Edit Profile:**
1. Navigate to `/profile`
2. Click "Chỉnh sửa" button
3. Update your information
4. Click "Lưu thay đổi"

---

### 6️⃣ **Enhanced Navbar** 🧭

**New Features in Navbar:**
- ✅ **User Dropdown Menu:**
  - Profile link
  - Order history link
  - Admin panel link (if admin)
  - Logout button
- ✅ **Wishlist Icon** - Quick access to favorites
- ✅ **User Avatar** - Shows first letter of name
- ✅ **Conditional Links** - Shows different items based on login status

**Navbar Menu Structure:**
```
For Guests:
- Home
- Sách
- Login Button

For Logged-in Users:
- Home
- Sách
- ❤️ Yêu thích
- Giỏ hàng
- [User Avatar Dropdown]
  - Tài khoản
  - Đơn hàng
  - Quản trị (if admin)
  - Đăng xuất
```

---

## 🔐 **Authentication Requirements**

### Public Routes:
- ✅ `/` - Home
- ✅ `/book` - Browse books (with search)
- ✅ `/book/:id` - Book details
- ✅ GET `/api/review/book/:bookId` - View reviews

### Protected Routes (Login Required):
- 🔒 `/profile` - User profile
- 🔒 `/wishlist` - Wishlist
- 🔒 `/cart` - Shopping cart
- 🔒 `/checkout` - Checkout
- 🔒 `/order-history` - Order history
- 🔒 All review API endpoints (except GET)
- 🔒 All wishlist API endpoints

### Admin Only Routes:
- 👑 `/admin/books` - Manage books
- 👑 `/admin/categories` - Manage categories
- 👑 `/admin/customers` - Manage customers
- 👑 `/admin/orders` - Manage orders

---

## 📊 **Database Schema**

### Reviews Collection:
```javascript
{
  book: ObjectId (ref: Book),
  customer: ObjectId (ref: Customer),
  rating: Number (1-5),
  comment: String,
  helpful: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Wishlist Collection:
```javascript
{
  customer: ObjectId (ref: Customer, unique),
  books: [ObjectId (ref: Book)],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 **UI/UX Improvements**

### Search Bar:
- 📱 Responsive design
- 🎨 Beautiful filters
- ⚡ Real-time filtering
- 🔄 Easy reset

### Wishlist Page:
- 💝 Beautiful empty state
- 🖼️ Book cards with images
- ⚡ Quick actions
- 📊 Item count display

### Order History:
- 📦 Card-based layout
- 🏷️ Status badges with colors
- 📅 Date formatting
- 💰 Price summaries

### User Profile:
- 👤 Avatar with initial
- ✏️ Inline editing
- 🔗 Quick action cards
- 🎨 Clean design

---

## 🚀 **Usage Guide**

### For Customers:

#### 1. **Browse & Search:**
```
1. Go to /book
2. Use search bar to find books
3. Apply filters (category, price, sort)
4. Click on book to view details
```

#### 2. **Add to Wishlist:**
```
1. View book details
2. Click "Add to Wishlist" button
3. View wishlist from navbar ❤️ icon
4. Add to cart from wishlist
```

#### 3. **Place Order:**
```
1. Add books to cart
2. Go to cart (/cart)
3. Adjust quantities
4. Proceed to checkout
5. Fill shipping details
6. Confirm order
```

#### 4. **Track Orders:**
```
1. Login to account
2. Click avatar → Đơn hàng
3. View all orders with status
4. Check order details
```

#### 5. **Manage Profile:**
```
1. Click avatar → Tài khoản
2. View/edit information
3. Use quick links to other pages
```

### For Admins:

#### 1. **Access Admin Panel:**
```
1. Login with admin account
2. Click avatar → Quản trị
3. Access all management pages
```

#### 2. **Manage Orders:**
```
1. Go to /admin/orders
2. View all orders
3. Update order status
4. Track deliveries
```

---

## 📱 **API Endpoints Summary**

### Reviews:
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/review` | ✅ | Create review |
| GET | `/api/review/book/:bookId` | ❌ | Get book reviews |
| PUT | `/api/review/:id` | ✅ | Update review |
| DELETE | `/api/review/:id` | ✅ | Delete review |
| PUT | `/api/review/:id/helpful` | ❌ | Mark helpful |

### Wishlist:
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wishlist` | ✅ | Get wishlist |
| POST | `/api/wishlist` | ✅ | Add to wishlist |
| DELETE | `/api/wishlist/:bookId` | ✅ | Remove item |
| DELETE | `/api/wishlist` | ✅ | Clear wishlist |
| GET | `/api/wishlist/check/:bookId` | ✅ | Check if in wishlist |

### Orders:
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/order/my/list` | ✅ | Get user's orders |
| GET | `/api/order` | 👑 | Get all orders (Admin) |
| POST | `/api/order` | ✅ | Create order |
| PUT | `/api/order/:id` | 👑 | Update status (Admin) |

---

## 🎯 **Key Benefits**

### For Users:
- ✅ Better book discovery with search & filters
- ✅ Save favorites for later
- ✅ Track order status
- ✅ Manage personal information
- ✅ Read reviews before buying
- ✅ Quick access to all features

### For Business:
- ✅ Better user engagement
- ✅ Reduced cart abandonment
- ✅ Customer insights from reviews
- ✅ Order tracking reduces support tickets
- ✅ Professional e-commerce experience

---

## 🔧 **Setup & Testing**

### 1. Start Backend:
```bash
cd Backend
npm start
```

### 2. Start Frontend:
```bash
cd Frontend
npm run dev
```

### 3. Test Features:
1. **Login** as a user
2. **Browse books** at `/book`
3. **Use search** and filters
4. **Add to wishlist** from book details
5. **View wishlist** at `/wishlist`
6. **Place an order**
7. **Check order history** at `/order-history`
8. **Update profile** at `/profile`

---

## 💡 **Tips & Best Practices**

### For Development:
- ✅ All API calls use centralized `api.js`
- ✅ Protected routes use `ProtectedRoute` component
- ✅ JWT tokens auto-attached to requests
- ✅ Consistent error handling with toast notifications

### For Users:
- 💡 Use wishlist to save books for later
- 💡 Check order history to track deliveries
- 💡 Update profile for faster checkout
- 💡 Use filters to find books quickly
- 💡 Read reviews before purchasing

---

## 🆕 **Future Enhancements (Not Implemented)**

Ideas for future development:
- 📧 Email notifications for orders
- 🔔 Push notifications for order status
- 💳 Payment gateway integration
- 📊 Advanced analytics dashboard
- 🏷️ Coupon/discount system
- ⭐ Featured/trending books
- 📱 Mobile app
- 💬 Live chat support
- 📦 Multiple shipping addresses
- 🎁 Gift cards

---

## 🐛 **Troubleshooting**

### Wishlist not showing:
- Ensure you're logged in
- Check browser console for errors
- Clear localStorage and login again

### Orders not appearing:
- Orders match by phone/fullname
- Ensure order was placed with same account
- Check backend logs for errors

### Search not working:
- Ensure backend is running
- Check if books are loaded
- Try clearing filters

---

## 📞 **Support**

For issues or questions:
1. Check browser console (F12)
2. Check backend terminal logs
3. Review this documentation
4. Check API responses in Network tab

---

**🎉 Congratulations! Your Book Store now has professional e-commerce features!**

**Version:** 3.0  
**Last Updated:** December 2025








