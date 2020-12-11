const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { generateRandomString } = require("./helpers");
const { findWithEmail } = require("./helpers");
const { findUrlsForUser } = require("./helpers");
const PORT = 8080;

// MIDDLEWEAR
app.use(cookieSession({ name: 'user_id', secret: 'secretKey' }));
app.use(bodyParser.urlencoded({extended: true}));

// SET EJS AS THE VIEW ENGINE
app.set('view engine', 'ejs');

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

const users = {};

const urlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID" 
  },
  "9sm5xK": { 
    longURL: "http://www.google.com",
    userID: "user2"
  }
};

/*********************************************************************
                          URL ROUTE HANDLERS
***********************************************************************/

app.get('/register', (req, res) => {

  const templateVars = { 
    user_id: users[req.session['user_id']],
  };

  res.render('urls_register', templateVars);
});

app.get('/', (req, res) => {

  if (!req.session['user_id']) {
    return res.redirect('/login');
  } else {
    return res.redirect('/urls');
  }

});

app.get('/urls', (req, res) => {
  
  if (!req.session['user_id']) {
    return res.redirect('/login');
  }

  const userURLS = findUrlsForUser(req.session['user_id'], urlDatabase);
  
  const templateVars = { 
    urls: userURLS, 
    user_id: users[req.session['user_id']],
  };

  res.render('urls_index', templateVars);
});

app.get('/login', (req, res) => {

  const templateVars = { 
    user_id: users[req.session['user_id']], 
  };

  res.render('urls_login', templateVars);
});

app.get('/urls/new', (req, res) => {
  
  if (!req.session['user_id']) {
    return res.redirect('/login');
  }
  
  const templateVars = { 
    user_id: users[req.session['user_id']] 
  };

  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  /* 
    IF USER IS LOGGED IN, BUT URL DOES NOT BELONG TO USER, 
    OR URL DOESN'T EXIST, OR USER IS NOT LOGGED IN, SEND AN ERROR
  */
 
  if (
    req.session['user_id'] && 
    urlDatabase[shortURL]['userID'] !== req.session['user_id'] ||
    !urlDatabase[shortURL] ||
    !req.session['user_id']
  ) {
    return res.status(404).send('Sorry, I could not find what you were looking for 🙁');
  }

  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'], 
    user_id: users[req.session['user_id']],
  };

  res.render('urls_show', templateVars);

});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]['longURL']);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 2);
  const id = generateRandomString();

  const user = {
    id, 
    email,
    password : hashedPassword
  };

  if (!email || !password) {
    return res.status(400).send('Please fill in all fields');
  }
  
  if (findWithEmail(email, users)) {
    return res.status(400).send('Email is already registered');
  }
  
  users[id] = user;

  req.session.user_id = id;

  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findWithEmail(email, users);

  if (!user || user.email !== email || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Email or password is incorrect, try again.');
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session['user_id'];

  urlDatabase[shortURL] = {
    longURL, 
    userID
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session['user_id'];
  const shortURL = req.params['shortURL'];
  if (!findUrlsForUser(userID, urlDatabase)[shortURL]) {
    return res.redirect("/urls/login");
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


module.exports = urlDatabase;
module.exports = users;

