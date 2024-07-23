const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  user: 'yourusername',
  host: 'localhost',
  database: 'library',
  password: 'yourpassword',
  port: 5432,
});

app.use(bodyParser.json());

// User Registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, email, hashedPassword]
  );
  res.json(result.rows[0]);
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length > 0) {
    const user = result.rows[0];
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user.user_id }, 'your_jwt_secret');
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } else {
    res.status(401).json({ error: 'User not found' });
  }
});

// Add Book (Admin)
app.post('/books', async (req, res) => {
  const { title, author, genre, price } = req.body;
  const result = await pool.query(
    'INSERT INTO books (title, author, genre, price) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, author, genre, price]
  );
  res.json(result.rows[0]);
});

// Search Books
app.get('/books', async (req, res) => {
  const { search } = req.query;
  const result = await pool.query(
    'SELECT * FROM books WHERE title ILIKE $1 OR author ILIKE $2 OR genre ILIKE $3',
    [`%${search}%`, `%${search}%`, `%${search}%`]
  );
  res.json(result.rows);
});

// Borrow Book
app.post('/borrow', async (req, res) => {
  const { userId, bookId } = req.body;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const result = await pool.query(
    'INSERT INTO borrowings (user_id, book_id, due_date) VALUES ($1, $2, $3) RETURNING *',
    [userId, bookId, dueDate]
  );
  await pool.query('UPDATE books SET available = FALSE WHERE book_id = $1', [bookId]);
  res.json(result.rows[0]);
});

// Buy Book
app.post('/buy', async (req, res) => {
  const { userId, bookId } = req.body;
  const bookResult = await pool.query('SELECT price FROM books WHERE book_id = $1', [bookId]);
  const price = bookResult.rows[0].price;
  const result = await pool.query(
    'INSERT INTO purchases (user_id, book_id, price) VALUES ($1, $2, $3) RETURNING *',
    [userId, bookId, price]
  );
  res.json(result.rows[0]);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
