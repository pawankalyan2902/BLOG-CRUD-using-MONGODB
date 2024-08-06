const express = require('express');
const app = express();

//fs
const path = require('path');

//we require sessions apckage to handle sessions
const sessions = require('express-session');

//mongodb to store sessions
const mongo_connect = require("connect-mongodb-session");
const connect = mongo_connect(sessions);

const session_store = new connect({
  uri: "mongodb://localhost:27017",
  databaseName: "auth_demo",
  collection: "sessions"
})

//IT CREATES A SESSION AND STORES IT IN DATABASE IF AND ONLY IF IT SATISFIES THE CONDITIONS BELOW
app.use(sessions(
  {
    secret: "super-secret",
    resave: false,
    saveUninitialized: false,
    store: session_store//CONNECT-MONGO is package which is used to configure the storing of these sessions created
  }
));

//To decode the json format data
app.use(express.json()); 

// Refactoring the routes
const blogRoutes = require('./routes/blog');

//database connection route
const db = require("./database/database");



// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)

//global variables
app.use(function(req,res,next)
{
  res.locals.isAuthenticated=req.session.isAuthenticated;
  res.locals.user_mail=req.session.user_mail;
  next();
});


app.use("/", blogRoutes);

app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error.message);
  res.status(500).render('500');
});
// app.use(function ( req, res) {
//   // Default error handling function
//   // Will become active whenever any route / middleware crashes

//   res.status(404).render('404');
// });




db.create().then(function () {
  app.listen(5000);
})

