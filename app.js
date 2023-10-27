if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

// Installed dependencies
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const passport = require('passport');

const accountsController = require('./routes/account.js');
const configurePassport = require('./utils/configurePassport.js');
const app = express();

app.use(express.static('public'));
app.set('view engine', 'pug');

mongoose.connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => console.log('Database connection established'))
  .catch((err) => { 
    console.log('Could not connect to database');
    console.log(err.message);
  });

// call helper module to configure passport
configurePassport(passport);

// configure session store for express-session
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_CONNECTION_STRING,
  collectionName: 'sessions',
});


app.use(session({
  secret: process.env.SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 hr
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res, next) => {
  res.render('index', { user: req.user });
});

app.use('/users', accountsController);

app.listen(process.env.PORT);