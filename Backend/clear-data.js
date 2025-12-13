import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const clearData = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MongoDBURI || 'mongodb://localhost:27017/bookstore');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Get current counts
    const categoriesCount = await db.collection('categories').countDocuments();
    const customersCount = await db.collection('customers').countDocuments();
    const booksCount = await db.collection('books').countDocuments();
    const ordersCount = await db.collection('orders').countDocuments();
    const cartsCount = await db.collection('carts').countDocuments();

    console.log('⚠️  WARNING: This will delete ALL data from the following collections:\n');
    console.log(`   📁 Categories: ${categoriesCount} documents`);
    console.log(`   👥 Customers: ${customersCount} documents`);
    console.log(`   📚 Books: ${booksCount} documents`);
    console.log(`   📦 Orders: ${ordersCount} documents`);
    console.log(`   🛒 Carts: ${cartsCount} documents`);
    console.log(`\n   Total: ${categoriesCount + customersCount + booksCount + ordersCount + cartsCount} documents will be deleted\n`);

    const answer = await askQuestion('Are you sure you want to continue? (yes/no): ');

    if (answer.toLowerCase() === 'yes') {
      console.log('\n🔄 Deleting data...\n');

      // Delete all collections
      const deletedCategories = await db.collection('categories').deleteMany({});
      console.log(`✅ Deleted ${deletedCategories.deletedCount} categories`);

      const deletedCustomers = await db.collection('customers').deleteMany({});
      console.log(`✅ Deleted ${deletedCustomers.deletedCount} customers`);

      const deletedBooks = await db.collection('books').deleteMany({});
      console.log(`✅ Deleted ${deletedBooks.deletedCount} books`);

      const deletedOrders = await db.collection('orders').deleteMany({});
      console.log(`✅ Deleted ${deletedOrders.deletedCount} orders`);

      const deletedCarts = await db.collection('carts').deleteMany({});
      console.log(`✅ Deleted ${deletedCarts.deletedCount} carts`);

      console.log('\n═══════════════════════════════════════════════════');
      console.log('🎉 ALL DATA CLEARED SUCCESSFULLY!');
      console.log('═══════════════════════════════════════════════════');
      console.log('\n💡 Next Steps:');
      console.log('   • Run import-data.js to add sample data');
      console.log('   • Or start fresh with your own data\n');
    } else {
      console.log('\n❌ Operation cancelled. No data was deleted.\n');
    }

    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error clearing data:');
    console.error(error.message);
    rl.close();
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the clear script
console.log('\n╔═══════════════════════════════════════════════════╗');
console.log('║     📚 BOOK STORE - CLEAR DATA SCRIPT           ║');
console.log('╚═══════════════════════════════════════════════════╝\n');

clearData();








