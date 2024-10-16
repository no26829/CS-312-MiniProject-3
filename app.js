const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session'); 
const app = express();


const PORT = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Track suser logins
app.use(session({
  secret: 'your_secret_key',    
  resave: false,                
  saveUninitialized: true       
}));

// Sets up routes
const indexRoutes = require('./src/routes/index');
app.use('/', indexRoutes);

// Starts the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
