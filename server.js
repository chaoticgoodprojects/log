const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded credentials with bcrypt hash ("ribs")
const USERNAME = 'admin';
const HASHED_PASSWORD = '$2b$10$pMsfbez8Tk4fur3CE6tsdOUaZRbbRAVWfskLukfUAAHpP9kWWvSAq';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'replace_this_with_a_secure_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false // change to true with HTTPS
  }
}));

function isAuthenticated(req) {
  return req.session && req.session.authenticated;
}

function requireLogin(req, res, next) {
  if (isAuthenticated(req)) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

app.use((req, res, next) => {
  if (req.path.startsWith('/admin') || req.path === '/admin.html') {
    return requireLogin(req, res, next);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt:");
  console.log("Username:", username);
  console.log("Password:", password);
  console.log("Comparing to hash:", HASHED_PASSWORD);

  try {
    const validUser = username === USERNAME;
    const validPass = await bcrypt.compare(password, HASHED_PASSWORD);

    console.log("Username valid:", validUser);
    console.log("Password valid:", validPass);

    if (validUser && validPass) {
      req.session.authenticated = true;
      req.session.save(() => {
        console.log("✅ Login successful, session set:", req.session);
        res.redirect('/admin.html');
      });
    } else {
      console.log("❌ Login failed: incorrect credentials");
      res.send(`<!DOCTYPE html><html><body><p style='color:red;text-align:center;'>invalid login</p><script>setTimeout(()=>{window.location='/login.html'}, 1500)</script></body></html>`);
    }
  } catch (err) {
    console.error("bcrypt compare error:", err);
    res.status(500).send("Internal server error");
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

app.get('/api/posts', (req, res) => {
  const posts = JSON.parse(fs.readFileSync('posts.json', 'utf8'));
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const { title, content, author, status } = req.body;
  const posts = JSON.parse(fs.readFileSync('posts.json', 'utf8'));

  const newPost = {
    title,
    content,
    author: author || 'anonymous',
    status: status || 'published',
    timestamp: Date.now()
  };

  posts.unshift(newPost);
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
  res.json({ success: true, post: newPost });
});

app.put('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const updatedPost = req.body;
  const posts = JSON.parse(fs.readFileSync('posts.json', 'utf8'));

  if (!posts[postId]) return res.status(404).json({ error: 'Post not found' });

  if (!updatedPost.timestamp) {
    updatedPost.timestamp = posts[postId].timestamp;
  }
  posts[postId] = updatedPost;

  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
  res.json({ success: true, post: updatedPost });
});

app.delete('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const posts = JSON.parse(fs.readFileSync('posts.json', 'utf8'));

  if (!posts[postId]) return res.status(404).json({ error: 'Post not found' });

  posts.splice(postId, 1);
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
