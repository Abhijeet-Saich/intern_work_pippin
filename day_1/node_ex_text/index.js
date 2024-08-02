const express = require('express');
const mysql = require('mysql2');
const { run } = require('node:test');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: 'matlab21', // Your MySQL password
  database: 'test_db'
});


const runInMemoryOperations = () => {
  for (let i = 0; i < 1000; i++) {
    const temp = i * i;
  }
};


connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});


//hosted proof
app.get('/',(req,res)=>{
  
    runInMemoryOperations();
    res.send("Server is well and okay...")
})


// Get all users
app.get('/users', (req, res) => {

  runInMemoryOperations();
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving users');
    } else {
      res.json(results);
    }
  });
});

// Create a new user
app.post('/user', (req, res) => {
  console.time('POST /user query time');
  const { name, email } = req.body;
  connection.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, results) => {
    console.timeEnd('POST /user query time');
    if (err) {
      res.status(500).send('Error creating user');
    } else {
      res.status(201).send('User created');
    }
  });
});

// Update a user
app.put('/user/:id', (req, res) => {
  console.time('PUT /user/:id query time');
  const { name, email } = req.body;
  const { id } = req.params;
  connection.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err, results) => {
    console.timeEnd('PUT /user/:id query time');
    if (err) {
      res.status(500).send('Error updating user');
    } else {
      res.send('User updated');
    }
  });
});

// Delete a user
app.delete('/user/:id', (req, res) => {
  console.time('DELETE /user/:id query time');
  const { id } = req.params;
  connection.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
    console.timeEnd('DELETE /user/:id query time');
    if (err) {
      res.status(500).send('Error deleting user');
    } else {
      res.send('User deleted');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
