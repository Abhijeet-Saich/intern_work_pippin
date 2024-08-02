import { serve } from 'bun';
import connection from './db.js';

const runInMemoryOperations = () => {
  for (let i = 0; i < 1000; i++) {
    const temp = i * i;
  }
};

const app = serve({
  port: 3000,
  fetch(req) {

    const { method, url } = req;
    const path = new URL(url).pathname;

    console.time("Request to Databse")
    if (path === '/users' && method === 'GET') {
      return getUsers(req);
    } else if (path === '/user' && method === 'POST') {
      return createUser(req);
    } else if (path.startsWith('/user/') && method === 'PUT') {
      return updateUser(req);
    } else if (path.startsWith('/user/') && method === 'DELETE') {
      return deleteUser(req);
    } else {
      return new Response('We don’t have what you are looking for!', { status: 404 });
    }
  },
});

console.log('Server running at http://localhost:3000');

async function getUsers(req: Request) {
  runInMemoryOperations();
  const [rows] = await connection.promise().query('SELECT * FROM users');
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } });
}

async function createUser(req: Request) {
  runInMemoryOperations();
  const data = await req.json();
  const { name, email } = data;
  await connection.promise().query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
  return new Response('User created', { status: 201 });
}

async function updateUser(req: Request) {
  const data = await req.json();
  const { name, email } = data;
  const id = req.url.split('/')[2];
  await connection.promise().query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  return new Response('User updated', { status: 200 });
}

async function deleteUser(req: Request) {
  const id = req.url.split('/')[2];
  await connection.promise().query('DELETE FROM users WHERE id = ?', [id]);
  return new Response('User deleted', { status: 200 });
}
