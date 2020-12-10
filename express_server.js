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

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2": {
    id: "user2", 
    email: "user2@example.com", 
    password: "purple"
  }
};

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
                          HELPER FUNCTIONS
***********************************************************************/

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

const findWithEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const findUrlsForUser = (id) => {
  let result = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url];
    }
  }
  return result;
};

/*********************************************************************
                          URL ROUTE HANDLERS
***********************************************************************/

app.get('/urls/register', (req, res) => {

  const templateVars = { 
    user_id: users[req.cookies['user_id']],
  };

  res.render('urls_register', templateVars);
});

app.get('/urls', (req, res) => {
  
  if (!req.cookies['user_id']) {
    return res.redirect('/urls/login');
  }

  const userURLS = findUrlsForUser(req.cookies['user_id']);
  
  const templateVars = { 
    urls: userURLS, 
    user_id: users[req.cookies['user_id']],
  };

  res.render('urls_index', templateVars);
});

app.get('/urls/login', (req, res) => {

  const templateVars = { 
    user_id: users[req.cookies['user_id']], 
  };

  res.render('urls_login', templateVars);
});

app.get('/urls/new', (req, res) => {
  
  if (!req.cookies['user_id']) {
    return res.redirect('/urls/login');
  }
  
  const templateVars = { 
    user_id: users[req.cookies['user_id']] 
  };

  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {

  if (!req.cookies['user_id']) {
    return res.redirect('/urls/login');
  }

  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'], 
    user_id: users[req.cookies['user_id']],
  };

  urlDatabase.hasOwnProperty(req.params.shortURL) ? 
  res.render('urls_show', templateVars) : 
  res.render('urls_error', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]['longURL']);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();

  const user = {
    id, 
    email,
    password
  }

  if (!email || !password) {
    return res.status(400).send('Please fill in all fields');
  }
  
  if (findWithEmail(email)) {
    return res.status(400).send('Email is already registered');
  }
  
  users[id] = user;

  res.cookie('user_id', id);

  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findWithEmail(email);
  const id = user.id;

  if (user.email !== email) {
    return res.status(403).send('Email or password is incorrect, try again.');
  } else if (user.password !== password) {
    return res.status(403).send('Email or password is incorrect, try again.');
  }

  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.cookies['user_id'];

  urlDatabase[shortURL] = {
    longURL, 
    userID
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.cookies['user_id'];
  const shortURL = req.params['shortURL'];
  // const urlObj = findUrlsForUser(userID);
  // console.log(shortURL);
  if (!findUrlsForUser(userID)[shortURL]) {
    return res.redirect("/urls/login");
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


