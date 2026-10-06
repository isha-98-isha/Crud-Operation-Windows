const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./database");

const app = express();
app.use(cors());

const PORT = 5000;
app.use(express.json());

const JWT_SECRET = "my-super-secret-key";

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Access token required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access token required",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
}

const users = [
  {
    id: 1,
    name: "Isha",
    role: "Devops Engineer",
    title: "Learn APIs",
    completed: false,
  },
  {
    id: 2,
    name: "Bhumika",
    role: "Frontend Developer",
    title: "Learn Node.js",
    completed: false,
  },
  {
    id: 3,
    name: "Nikhil",
    role: "Frontend Developer",
    title: "Learn databases",
    completed: false,
  },
  {
    id: 4,
    name: "Yogesh",
    role: "Civil Engineer",
    title: "Learn Express.js",
    completed: true,
  },
  {
    id: 5,
    name: "pooja",
    role: "Backend Developer",
    title: "Learn RESTful APIs",
    completed: false,
  },
  {
    id: 6,
    name: "Priya",
    role: "Full Stack Developer",
    title: "Learn GraphQL",
    completed: true,
  },
  {
    id: 7,
    name: "Jayesh",
    role: "Backend Developer",
    title: "Learn Python",
    completed: false,
  },
];

//Get request-------------------------------------------------------------------------------------------------------------//

app.get("/api/users", authenticateToken, (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();

  res.json(users);
});
//----------------------------------------------------------//
app.get("/api/users/search", (req, res) => {
  const role = req.query.role;

  const users = db.prepare("SELECT * FROM users WHERE role = ?").all(role);

  if (users.length === 0) {
    return res.status(404).json({
      message: "No users found with the specified role",
    });
  }

  res.json(users);
  console.log(req.user);
});

//----------------------------------------------------------//

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
    });
  }

  // 2. Check if email already exists
  const existingUser = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  if (existingUser) {
    return res.status(409).json({
      message: "Email already registered",
    });
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Save user
  const result = db
    .prepare(
      `
      INSERT INTO users
      (name, role, title, completed, email, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    )
    .run(name, "User", "New User", 0, email, hashedPassword);

  // 5. Return created user
  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: Number(result.lastInsertRowid),
      name,
      email,
      role: "User",
    },
  });
});

//----------------------------------------------------------//

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  // 2. Find user
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // 3. Compare password with stored hash
  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // 4. Create JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );

  // 5. Return token
  res.json({
    message: "Login successful",
    token: token,
  });
});

//----------------------------------------------------------//

app.get("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.json(user);
});

//Put request-------------------------------------------------------------------------------------------------------------//

app.put("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);

  const { name, role, title, completed } = req.body;

  if (
    typeof name !== "string" ||
    typeof role !== "string" ||
    typeof title !== "string" ||
    typeof completed !== "boolean"
  ) {
    return res.status(400).json({
      message: "name, role, title and completed are required",
    });
  }

  const result = db
    .prepare(
      `
      UPDATE users
      SET name = ?, role = ?, title = ?, completed = ?
      WHERE id = ?
    `,
    )
    .run(name.trim(), role.trim(), title.trim(), completed ? 1 : 0, id);

  if (result.changes === 0) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  res.json(updatedUser);
});

//Patch request-------------------------------------------------------------------------------------------------------------//

app.patch("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);

  const { name, role, title, completed } = req.body;

  const existingUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  if (!existingUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({
      message: "Name must be a string",
    });
  }

  if (role !== undefined && typeof role !== "string") {
    return res.status(400).json({
      message: "Role must be a string",
    });
  }

  if (title !== undefined && typeof title !== "string") {
    return res.status(400).json({
      message: "Title must be a string",
    });
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({
      message: "Completed must be a boolean",
    });
  }

  const updatedName = name !== undefined ? name.trim() : existingUser.name;
  const updatedRole = role !== undefined ? role.trim() : existingUser.role;
  const updatedTitle = title !== undefined ? title.trim() : existingUser.title;
  const updatedCompleted =
    completed !== undefined ? (completed ? 1 : 0) : existingUser.completed;

  db.prepare(
    `
    UPDATE users
    SET name = ?, role = ?, title = ?, completed = ?
    WHERE id = ?
  `,
  ).run(updatedName, updatedRole, updatedTitle, updatedCompleted, id);

  const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  res.json(updatedUser);
});

//Post request-------------------------------------------------------------------------------------------------------------//

app.post("/api/users", (req, res) => {
  const { name, role } = req.body;

  if (
    typeof name !== "string" ||
    typeof role !== "string" ||
    !name.trim() ||
    !role.trim()
  ) {
    return res.status(400).json({
      message: "Name and role are required",
    });
  }

  const statement = db.prepare(`
    INSERT INTO users (name, role, title, completed)
    VALUES (?, ?, ?, ?)
  `);

  const result = statement.run(name.trim(), role.trim(), "New Task", 0);

  res.status(201).json({
    id: Number(result.lastInsertRowid),
    name: name.trim(),
    role: role.trim(),
    title: "New Task",
    completed: false,
  });
});

//Delete request-------------------------------------------------------------------------------------------------------------//

app.delete(
  "/api/users/:id",
  authenticateToken,
  requireRole("Frontend Developer"),
  (req, res) => {
    const id = Number(req.params.id);

    const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User deleted successfully",
    });
  },
);

//Port-------------------------------------------------------------------------------------------------------------//
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
