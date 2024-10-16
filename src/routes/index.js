const express = require('express');
const router = express.Router();
const { Client } = require('pg');

// Set up PostgreSQL connection
const client = new Client({
  user: 'postgres',         
  host: 'localhost',       
  database: 'BlogDB',       
  password: '1234',         
  port: 5433,              
});

// Connect to PostgreSQL
client.connect((err) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to BlogDB');
  }
});

// Shows all the blog posts
router.get('/', (req, res) => {
  client.query('SELECT * FROM blogs ORDER BY blog_id ASC', (err, result) => {
    if (err) {
      console.error('Sorry, error getting the blogs', err);
      res.send('Sorry, error getting the blogs');
    } else {
      res.render('index', { blogPosts: result.rows, session: req.session });
    }
  });
});

// Shows the form to create a new blog post
router.get('/new', (req, res) => {
  res.render('new', { session: req.session });
});

// Create a new blog post
router.post('/new', (req, res) => {
  const { title, body, creator_name } = req.body;
  const creator_user_id = req.session.user_id; 
  const query = 'INSERT INTO blogs (title, body, creator_name, creator_user_id) VALUES ($1, $2, $3, $4)';
  client.query(query, [title, body, creator_name, creator_user_id], (err, result) => {
    if (err) {
      console.error('Error creating the blog post', err);
      res.send('Error creating the blog post');
    } else {
      res.redirect('/');
    }
  });
});

// Shows the form to edit a blog post
router.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  client.query('SELECT * FROM blogs WHERE blog_id = $1', [id], (err, result) => {
    if (err) {
      console.error('Error fetching the blog post', err);
      res.send('Error fetching the blog post');
    } else {
      const post = result.rows[0];
      res.render('edit', { post, session: req.session });
    }
  });
});

// Updates a blog post
router.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const { title, body, creator_name } = req.body;
  const query = 'UPDATE blogs SET title = $1, body = $2, creator_name = $3 WHERE blog_id = $4';
  client.query(query, [title, body, creator_name, id], (err, result) => {
    if (err) {
      console.error('Error updating the blog post', err);
      res.send('Error updating the blog post');
    } else {
      res.redirect('/');
    }
  });
});

// Deletes a blog post
router.post('/delete/:id', (req, res) => {
  const id = req.params.id;
  client.query('DELETE FROM blogs WHERE blog_id = $1', [id], (err, result) => {
    if (err) {
      console.error('Error deleting the blog post', err);
      res.send('Error deleting the blog post');
    } else {
      res.redirect('/');
    }
  });
});

// sign-in form
router.get('/signin', (req, res) => {
  res.render('signin', { session: req.session });
});


router.post('/signin', (req, res) => {
  const { name, password } = req.body;

  
  if (!name || !password) {
    return res.send('Username or password is missing.');
  }

  console.log('Username input:', name);  

  // Check is user exists
  client.query('SELECT * FROM users WHERE name ILIKE $1', [name], (err, result) => {
    if (err) {
      console.error('Sorry :c, there was an error getting the user:', err.stack); 
      return res.send('Sorry :c, there was an error getting the user.');
    }

    if (result.rows.length === 0) {
      console.log('Sorry :c, username does not exist in DB');  
      return res.send('Sorry :c, username does not exist.');
    } else {
      // Check for pass
      const user = result.rows[0];
      if (user.password !== password) {

        // If the password is wrong
        return res.send('Sorry, the password is wrong.');
      } else {

        // login if correct info
        req.session.user_id = user.user_id; 
        return res.redirect('/');
      }
    }
  });
});

// sign-up form
router.get('/signup', (req, res) => {
  res.render('signup', { session: req.session });
});

// Route for signups
router.post('/signup', (req, res) => {
  const { password, name } = req.body;

  // Insert data into the users table
  const query = 'INSERT INTO users (password, name) VALUES ($1, $2)';
  client.query(query, [password, name], (err, result) => {
    if (err) {
      console.error('Sorry :c, there was an error creating user:', err.stack); 
      return res.send('Sorry :c, there was an error creating user.');
    } else {
      return res.redirect('/signin');
    }
  });
});

module.exports = router;
