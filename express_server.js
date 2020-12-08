const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;

// USE BODY PARSER TO MAKE POST REQUESTS
app.use(bodyParser.urlencoded({extended: true}));

// SET EJS AS THE VIEW ENGINE
app.set('view engine', 'ejs');

const generateRandomString = () => {
  let result = [];
  while(result.length < 6) {
    result.push(String.fromCharCode(Math.floor(Math.random() * 26) + 97));
  }
  result.forEach((x, i, a) => {
    if (i % 2 === 0) {
      a[i] = a[i].toUpperCase();
    }
  });
  return result.join('');s
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/*~~~~~~~~~~~~~~~~URL ROUTE HANDLERS~~~~~~~~~~~~~~~~*/

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/u/:shortURL', (req, res) => {
  // console.log(req.params.shortURL);
  res.redirect(urlDatabase[req.params.shortURL]);
});

