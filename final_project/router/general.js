const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (isValid(username)) {
    return res.status(400).json({message: "Username already exists"});
  }
  users.push({ username, password });
  return res.status(201).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  try {
    const booksList = await new Promise((resolve, reject) => {
      if (Object.keys(books).length === 0) {
        reject(new Error("No books available"));
      } else {
        resolve(books);
      }
    });
    return res.end(JSON.stringify(booksList, null, 4));
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const book = await new Promise((resolve, reject) => {
      const isbn = req.params.isbn;
      if (!books[isbn]) {
        reject(new Error("Book not found"));
      } else {
        resolve(books[isbn]);
      }
    });
    return res.end(JSON.stringify(book, null, 4));
  } catch (err) {
    return res.status(404).json({message: err.message});
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const booksByAuthor = await new Promise((resolve, reject) => {
      const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
      if (booksByAuthor.length === 0) {
        reject(new Error("No books found for this author"));
      } else {
      resolve(booksByAuthor);
    }
  });
  return res.end(JSON.stringify(booksByAuthor, null, 4));
} catch (err) {
  return res.status(404).json({message: err.message});
}
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const booksByTitle = await new Promise((resolve, reject) => {
      const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
      if (booksByTitle.length === 0) {
        reject(new Error("No books found with this title"));
      } else {
      resolve(booksByTitle);
    }
  });
  return res.end(JSON.stringify(booksByTitle, null, 4));
} catch (err) {
  return res.status(404).json({message: err.message});
}
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const reviews = books[isbn] ? books[isbn].reviews : null;
  if (reviews) {
    return res.end(JSON.stringify(reviews, null, 4));
  } else {
    return res.status(404).json({message: "No reviews found for this book"});
  }
});

module.exports.general = public_users;
