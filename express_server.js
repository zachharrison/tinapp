const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const PORT = 8080;

// USE MIDDLEWEAR
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));


// SET EJS AS THE VIEW ENGINE
app.set('view engine', 'ejs');

const generateRandomString = () => {
  let result = [];
  let i = 0;
  while(result.length < 6) {
    i % 2 === 0 && i !== 1 ? result.push(String.fromCharCode(Math.floor(Math.random() * 26) + 97)) : 
    i % 3 === 0 || i === 1 ? result.push(String.fromCharCode(Math.floor(Math.random() * 9) + 48)) :
    result.push(String.fromCharCode(Math.floor(Math.random() * 26) + 65))
    i++;
  }
  return result.join('');
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

/*~~~~~~~~~~~~~~~~~~~~URL ROUTE HANDLERS~~~~~~~~~~~~~~~~~~~~*/

app.get('/urls.json', (req, res) => res.json(urlDatabase));

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username']};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username:req.cookies['username'] }
  res.render('urls_new', templateVars)
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
  urlDatabase.hasOwnProperty(req.params.shortURL) ? res.render('urls_show', templateVars) : 
  res.render('urls_error', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  urlDatabase.hasOwnProperty(req.params.shortURL) ? res.redirect(urlDatabase[req.params.shortURL]) : 
  res.render('urls_error');
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


