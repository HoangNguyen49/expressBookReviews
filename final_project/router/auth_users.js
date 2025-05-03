const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  return users.some((user) => user.username === username); //check if username already exists
}

const authenticatedUser = (username, password) => { //returns boolean
  return users.some((user) => user.username === username && user.password === password); //check if username and password match
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate an access token
    const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

    //save token into session
    req.session.authorization = { accessToken, username };

    return res.status(200).send("User successfully logged in");
  }
  else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});


// add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: Please login first" });
  }

  if (!review) {
    return res.status(400).json({ message: "No review content provided" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully" });
});


//delete a book review

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const username = req.session.authorization?.username;

  // Check if the user is logged in
  if (!username) {
    return res.status(401).json({ message: "Unauthorized: Please login first" });
  }

  // Check if the book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has a review for this book
  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Review not found for this user" });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
