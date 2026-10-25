
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  })
);

app.use(express.json());

const mockUser = {
  email: "demo@lumora.com",
  password: "Lumora123"
};

app.get("/", (req, res) => {
  res.send("Lumora API is running!");
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required."
    });
  }

  if (
    email.trim().toLowerCase() !== mockUser.email ||
    password !== mockUser.password
  ) {
    return res.status(401).json({
      message: "Invalid email or password."
    });
  }

  return res.status(200).json({
    message: "Login successful!",
    user: {
      name: "Lumora User",
      email: mockUser.email
    }
  });
});

app.listen(PORT, () => {
  console.log(`Lumora API is running on port ${PORT}`);
});
