const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

const POSTS_FILE = path.join(__dirname, 'posts.json');

// GET all posts
app.get('/api/posts', (req, res) => {
  fs.readFile(POSTS_FILE, (err, data) => {
    if (err) return res.status(500).send('Error reading posts');
    res.json(JSON.parse(data));
  });
});

// POST new post
app.post('/api/posts', (req, res) => {
  const { title, content } = req.body;
  const newPost = { title, content, timestamp: Date.now() };

  fs.readFile(POSTS_FILE, (err, data) => {
    const posts = err ? [] : JSON.parse(data);
    posts.unshift(newPost); // add to top
    fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), (err) => {
      if (err) return res.status(500).send('Failed to save post');
      res.status(201).send('Post created');
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
