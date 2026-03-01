require('dotenv').config();
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const Book = require('./src/models/Book');
const Order = require('./src/models/Order');

const seedDatabase = async () => {
  try {
    // Clear existing data in correct order (respect foreign keys)
    await Order.destroy({ where: {}, force: true });
    console.log('Cleared orders');
    
    await Book.destroy({ where: {}, force: true });
    console.log('Cleared books');
    
    await User.destroy({ where: {}, force: true });
    console.log('Cleared users');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bookstore.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin user created');

    // Create sample books with Indian rupee prices
    const books = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0-7432-7356-5',
        description: 'A classic American novel set in the Jazz Age.',
        category: 'Fiction',
        price: 599.99,
        stock: 50,
        publisher: 'Scribner',
        rating: 4.5,
        image: 'https://covers.openlibrary.org/b/id/7725242-L.jpg',
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0-06-112008-4',
        description: 'A gripping tale of racial injustice and childhood innocence.',
        category: 'Fiction',
        price: 649.99,
        stock: 45,
        publisher: 'J.B. Lippincott',
        rating: 4.8,
        image: 'https://covers.openlibrary.org/b/id/7883344-L.jpg',
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0-452-26423-9',
        description: 'A dystopian social science fiction novel.',
        category: 'Fiction',
        price: 625.00,
        stock: 40,
        publisher: 'Secker & Warburg',
        rating: 4.7,
        image: 'https://covers.openlibrary.org/b/id/7994614-L.jpg',
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        isbn: '978-0-06-231609-7',
        description: 'A brief history of humankind.',
        category: 'Non-Fiction',
        price: 799.99,
        stock: 60,
        publisher: 'Harper',
        rating: 4.6,
        image: 'https://covers.openlibrary.org/b/id/8430065-L.jpg',
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        isbn: '978-0735211292',
        description: 'Tiny changes, remarkable results.',
        category: 'Self-Help',
        price: 699.99,
        stock: 55,
        publisher: 'Avery',
        rating: 4.9,
        image: 'https://covers.openlibrary.org/b/id/9288801-L.jpg',
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '978-0553380163',
        description: 'From the big bang to black holes.',
        category: 'Science',
        price: 675.00,
        stock: 35,
        publisher: 'Bantam',
        rating: 4.4,
        image: 'https://covers.openlibrary.org/b/id/7914649-L.jpg',
      },
      {
        title: 'The Silk Roads',
        author: 'Peter Frankopan',
        isbn: '978-1596916692',
        description: 'A new history of the world.',
        category: 'History',
        price: 749.99,
        stock: 30,
        publisher: 'Knopf',
        rating: 4.5,
        image: 'https://covers.openlibrary.org/b/id/8275249-L.jpg',
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        description: 'A handbook of agile software craftsmanship.',
        category: 'Technology',
        price: 1299.99,
        stock: 25,
        publisher: 'Prentice Hall',
        rating: 4.7,
        image: 'https://covers.openlibrary.org/b/id/8257862-L.jpg',
      },
    ];

    await Book.bulkCreate(books);
    console.log('Sample books created with Indian rupee prices');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
