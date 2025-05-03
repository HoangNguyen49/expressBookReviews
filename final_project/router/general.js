const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const existingUser = users[username];
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get book list using async/await
public_users.get('/', async function (req, res) {
  const getBooks = () => {
    return new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject("No books found");
      }
    });
  };

  try {
    const bookList = await getBooks();
    res.status(200).send(JSON.stringify(bookList, null, 2));
  } catch (err) {
    res.status(500).json({ message: err });
  }
});


// Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  // Promise giả lập xử lý bất đồng bộ
  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    });
  };

  try {
    const book = await getBookByISBN(isbn);
    res.status(200).send(JSON.stringify(book, null, 2));
  } catch (err) {
    res.status(404).json({ message: err });
  }
});


// Get book details based on author using async/await
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;

  const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      const bookKeys = Object.keys(books);
      const booksByAuthor = [];

      bookKeys.forEach((key) => {
        if (books[key].author === author) {
          booksByAuthor.push(books[key]);
        }
      });

      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject("No books found for this author");
      }
    });
  };

  try {
    const result = await getBooksByAuthor(author);
    res.status(200).send(JSON.stringify(result, null, 2));
  } catch (err) {
    res.status(404).json({ message: err });
  }
});


// Get book details based on title using async/await
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;

  const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      const bookKeys = Object.keys(books);
      const booksByTitle = [];

      bookKeys.forEach((key) => {
        if (books[key].title === title) {
          booksByTitle.push(books[key]);
        }
      });

      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject("No books found with this title");
      }
    });
  };

  try {
    const result = await getBooksByTitle(title);
    res.status(200).send(JSON.stringify(result, null, 2));
  } catch (err) {
    res.status(404).json({ message: err });
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if(book){
    return res.status(200).send(JSON.stringify(book.reviews, null, 2));
  }else{
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
