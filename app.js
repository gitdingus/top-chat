if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

// Installed dependencies
const express = require('express');
const session = require('express-session');
const expressWs = require('express-ws');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const passport = require('passport');

const configurePassport = require('./utils/configurePassport.js');

const app = express();
const wsInstance = expressWs(app);

const accountsRouter = require('./routes/account.js');
const chatRouter = require('./routes/chats.js');

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

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res, next) => {
  res.render('index', { user: req.user });
});

// Only routes allowed to unauthenticated users are:
// login
// account creation
// anything else should redirect to home
app.use((req, res, next) => {
  if (!req.path.match(/login|create-account/) && !req.isAuthenticated()) {
    return res.redirect('/');
  }

  next();
});

app.use('/chat', chatRouter);
app.use('/users', accountsRouter);

app.use((err, req, res, next) => {
  console.log(err);
  res.render('error', {
    error: err,
    user: req.user,
  });
});

app.listen(process.env.PORT);

console.log(`Listening on port ${process.env.PORT}`)