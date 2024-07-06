const { getCommentsController, addCommentController, lastCommentGetController, deleteCommentController, updateCommentController } = require('./controllers/commentControllers.js');
const { signUpPostController, logInPostController, logOutPostController, checkAuthController } = require('./controllers/authControllers.js');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
app.use(cookieParser());

const PORT = 3001;
const HOST = "127.0.0.1";

app.use(cookieParser());
app.set('views', path.join(__dirname, 'website/homepage/html'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('login'));
app.use(express.static('signup'));
app.use(express.static('comments'));
app.use(express.static('homepage'));

// adrasteia
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// homepage
app.get('/homepage', (req, res) => {
  // res.sendFile(path.join(__dirname, 'website', 'homepage', 'html', 'index.html'));
  const sessionId = req.cookies.session_id;
  res.render('index', { hasSession: !!sessionId });
});
app.get('/website/homepage/css/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'homepage', 'css', 'style.css'));
});
app.get('/website/homepage/css/normalize.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'homepage', 'css', 'normalize.css'));
});
app.get('/website/homepage/validate.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'homepage', 'validate.js'));
});
app.get('/website/homepage/fetch.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'homepage', 'fetch.js'));
});

// signup
app.get('/signup/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'signup', 'index.html'));
});
app.get('/website/signup/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'signup', 'style.css'));
});
app.get('/website/signup/validate.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'signup', 'validate.js'));
});
app.get('/website/signup/fetch.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'signup', 'fetch.js'));
});
app.post('/signup', (req, res) => {
  signUpPostController(req, res);
});

// login
app.get('/login/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'login', 'index.html'));
});
app.get('/website/login/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'login', 'style.css'));
});
app.get('/website/login/validate.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'login', 'validate.js'));
});
app.get('/website/login/fetch.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'login', 'fetch.js'));
});
app.post('/login', (req, res) => {
  logInPostController(req, res);
});

// logout
app.get('/logout/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'logout', 'index.html'));
});
app.get('/website/logout/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'logout', 'style.css'));
});
app.get('/website/logout/fetch.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'logout', 'fetch.js'));
});
app.post('/website/logout/index.html', (req, res) => {
  logOutPostController(req, res);
});

// операции с бд
app.get('/lastcomment', (req, res) => {
  lastCommentGetController(req, res);
});
app.get('/table', (req, res) => {
  getCommentsController(req, res);
});
app.post('/comments', (req, res) => {
  addCommentController(req, res);
});
app.put('/comments/:id', (req, res) => {
  updateCommentController(req, res);
});
app.delete('/comments/:id', (req, res) => {
  deleteCommentController(req, res);
});

// проверка авторизации
app.get('/check-auth', (req, res) => {
  const sessionId = req.cookies.session_id;
  const isAuthenticated = !!sessionId;
  res.json({ isAuthenticated });
});


app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});