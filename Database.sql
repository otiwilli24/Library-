CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    genre VARCHAR(100),
    price DECIMAL(10, 2),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE borrowings (
    borrowing_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    book_id INT REFERENCES books(book_id),
    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    returned BOOLEAN DEFAULT FALSE
);

CREATE TABLE purchases (
    purchase_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    book_id INT REFERENCES books(book_id),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price DECIMAL(10, 2)
);
