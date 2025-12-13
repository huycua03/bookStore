import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const importData = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MongoDBURI || 'mongodb://localhost:27017/bookstore');
    console.log('✅ Connected to MongoDB\n');

    // Read data file
    console.log('📖 Reading data.json...');
    const dataPath = path.resolve(__dirname, '../data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log('✅ Data file loaded\n');

    // Get database
    const db = mongoose.connection.db;

    // Import categories
    if (data.categories && data.categories.length > 0) {
      console.log('🔄 Importing categories...');
      await db.collection('categories').deleteMany({});
      await db.collection('categories').insertMany(
        data.categories.map(item => ({
          ...item,
          _id: new mongoose.Types.ObjectId(item._id.$oid),
          createdAt: new Date(item.createdAt.$date),
          updatedAt: new Date(item.updatedAt.$date)
        }))
      );
      console.log(`✅ Imported ${data.categories.length} categories\n`);
    }

    // Import customers with properly hashed passwords
    if (data.customers && data.customers.length > 0) {
      console.log('🔄 Importing customers...');
      console.log('⏳ Hashing passwords (this may take a moment)...');
      await db.collection('customers').deleteMany({});
      
      // Hash password for all customers
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      
      await db.collection('customers').insertMany(
        data.customers.map(item => ({
          ...item,
          _id: new mongoose.Types.ObjectId(item._id.$oid),
          password: hashedPassword, // Use properly hashed password
          createdAt: new Date(item.createdAt.$date),
          updatedAt: new Date(item.updatedAt.$date)
        }))
      );
      console.log(`✅ Imported ${data.customers.length} customers`);
      console.log('   📧 All customers have password: admin123\n');
    }

    // Import books
    if (data.books && data.books.length > 0) {
      console.log('🔄 Importing books...');
      await db.collection('books').deleteMany({});
      await db.collection('books').insertMany(
        data.books.map(item => ({
          ...item,
          _id: new mongoose.Types.ObjectId(item._id.$oid),
          category: new mongoose.Types.ObjectId(item.category.$oid)
        }))
      );
      console.log(`✅ Imported ${data.books.length} books\n`);
    }

    // Import orders
    if (data.orders && data.orders.length > 0) {
      console.log('🔄 Importing orders...');
      await db.collection('orders').deleteMany({});
      await db.collection('orders').insertMany(
        data.orders.map(item => ({
          ...item,
          _id: new mongoose.Types.ObjectId(item._id.$oid),
          orderDate: new Date(item.orderDate.$date)
        }))
      );
      console.log(`✅ Imported ${data.orders.length} orders\n`);
    }

    // Import carts
    if (data.carts && data.carts.length > 0) {
      console.log('🔄 Importing carts...');
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
      console.log(`✅ Imported ${data.carts.length} carts\n`);
    }

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 ALL DATA IMPORTED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   • Categories: ${data.categories.length}`);
    console.log(`   • Customers: ${data.customers.length}`);
    console.log(`   • Books: ${data.books.length}`);
    console.log(`   • Orders: ${data.orders.length}`);
    console.log(`   • Carts: ${data.carts.length}`);
    console.log('\n👤 Admin Login:');
    console.log('   Email: admin@bookstore.com');
    console.log('   Password: admin123');
    console.log('\n💡 Next Steps:');
    console.log('   1. Start your backend: npm start');
    console.log('   2. Start your frontend: npm run dev');
    console.log('   3. Login with admin credentials');
    console.log('   4. Enjoy your Book Store app! 🚀');
    console.log('═══════════════════════════════════════════════════\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error importing data:');
    console.error(error.message);
    console.error('\n💡 Tips:');
    console.error('   • Make sure MongoDB is running');
    console.error('   • Check that data.json exists in the project root');
    console.error('   • Verify your .env file has MongoDBURI set');
    console.error('   • Try running: mongod (to start MongoDB)\n');
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the import
console.log('\n╔═══════════════════════════════════════════════════╗');
console.log('║     📚 BOOK STORE - DATA IMPORT SCRIPT          ║');
console.log('╚═══════════════════════════════════════════════════╝\n');

importData();








