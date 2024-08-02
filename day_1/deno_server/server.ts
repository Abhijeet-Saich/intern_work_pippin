import { Application, Router } from "./deps.ts";
import { Client } from "./deps.ts";

// Create a new MySQL client
const client = await new Client().connect({
  hostname: "localhost",
  username: "root", // Your MySQL username
  db: "test_db",
  password: "matlab21", // Your MySQL password
});

// Middleware to parse JSON bodies
const app = new Application();
const router = new Router();



const runInMemoryOperations = () => {
  for (let i = 0; i < 1000; i++) {
    const temp = i * i;
  }
};



// Hosted proof
router.get("/", (context) => {
  runInMemoryOperations();
  context.response.body = "Server is well and okay but this time its deno...";
});




// Get all users
router.get("/users", async (context) => {
  
  runInMemoryOperations();

  try {
    const result = await client.query("SELECT * FROM users");
    context.response.body = result;
  } catch (err) {
    context.response.status = 500;
    context.response.body = "Error retrieving users";
  }
});




// Create a new user
router.post("/user", async (context) => {

  runInMemoryOperations();

  console.time("POST /user query time");
  try {
    const { name, email } = await context.request.body().value;
    await client.execute("INSERT INTO users(name, email) VALUES(?, ?)", [name, email]);
    console.timeEnd("POST /user query time");
    context.response.status = 201;
    context.response.body = "User created";
  } catch (err) {
    console.timeEnd("POST /user query time");
    context.response.status = 500;
    context.response.body = "Error creating user";
  }
});




// Update a user
router.put("/user/:id", async (context) => {
  console.time("PUT /user/:id in-memory operations time");
  runInMemoryOperations();
  console.timeEnd("PUT /user/:id in-memory operations time");

  console.time("PUT /user/:id query time");
  try {
    const { name, email } = await context.request.body().value;
    const { id } = context.params;
    await client.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, id]);
    console.timeEnd("PUT /user/:id query time");
    context.response.body = "User updated";
  } catch (err) {
    console.timeEnd("PUT /user/:id query time");
    context.response.status = 500;
    context.response.body = "Error updating user";
  }
});

// Delete a user
router.delete("/user/:id", async (context) => {
  console.time("DELETE /user/:id in-memory operations time");
  runInMemoryOperations();
  console.timeEnd("DELETE /user/:id in-memory operations time");

  console.time("DELETE /user/:id query time");
  try {
    const { id } = context.params;
    await client.execute("DELETE FROM users WHERE id = ?", [id]);
    console.timeEnd("DELETE /user/:id query time");
    context.response.body = "User deleted";
  } catch (err) {
    console.timeEnd("DELETE /user/:id query time");
    context.response.status = 500;
    context.response.body = "Error deleting user";
  }
});

// Test route for 1000 iterations without database calls
router.get("/test", (context) => {
  console.time("GET /test in-memory operations time");
  runInMemoryOperations();
  console.timeEnd("GET /test in-memory operations time");

  context.response.body = "Completed 1000 iterations of in-memory operations";
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(`Server running at http://${hostname ?? "localhost"}:${port}`);
});

await app.listen({ port: 3000 });

// Close the database connection when the server stops
addEventListener("unload", () => {
  client.close();
});
