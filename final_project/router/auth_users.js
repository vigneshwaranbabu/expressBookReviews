const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const jwtSecret = 'fingerprint_customer';

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username) || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const accessToken = jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });

  return res.status(200).json({ message: "Login successful", accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.query; // 👈 note: review must come from query param
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  let username;
  try {
    const decoded = jwt.verify(token, jwtSecret);
    username = decoded.username;
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required in query parameter" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  const isUpdate = !!book.reviews[username];
  book.reviews[username] = review;

  return res.status(200).json({ 
    message: isUpdate ? "Review updated successfully" : "Review added successfully",
    reviews: book.reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  let username;
  try {
    const decoded = jwt.verify(token, jwtSecret);
    username = decoded.username;
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  const book = books[isbn];
  if (!book || !book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete book.reviews[username];

  return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
