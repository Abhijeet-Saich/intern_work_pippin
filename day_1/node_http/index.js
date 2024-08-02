const http = require('http');
const mysql = require('mysql2');
const url = require('url');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'matlab21',
  database: 'test_db'
});


const runInMemoryOperations = () => {
  for (let i = 0; i < 1000; i++) {
    const temp = i * i;
  }
};

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

// Helper function to parse JSON body
function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    callback(JSON.parse(body));
  });
}

// Create an HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;
  const method = req.method;


  if (pathname === '/users' && method === 'GET') {
    runInMemoryOperations();
    connection.query('SELECT * FROM users', (err, results) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error retrieving users');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
      }
    });
  } else if (pathname === '/user' && method === 'POST') {
    parseBody(req, body => {
      const { name, email } = body;
      connection.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, results) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error creating user');
        } else {
          res.writeHead(201, { 'Content-Type': 'text/plain' });
          res.end('User created');
        }
      });
    });
  } else if (pathname.startsWith('/user/') && method === 'PUT') {
    const id = pathname.split('/')[2];
    parseBody(req, body => {
      const { name, email } = body;
      connection.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err, results) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error updating user');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('User updated');
        }
      });
    });
  } else if (pathname.startsWith('/user/') && method === 'DELETE') {
    const id = pathname.split('/')[2];
    connection.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error deleting user');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('User deleted');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('We don’t have what you are looking for and this http server not express one!');
  }
});

// Start the server
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
