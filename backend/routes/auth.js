const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../db");
const { auth } = require("../middleware/auth");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    const db = await getDb();
    const existing = await db.get("SELECT id FROM users WHERE email = ?", email);
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const id = uuidv4();
    const hashed = bcrypt.hashSync(password, 10);
    await db.run("INSERT INTO users (id, name, email, password, phone) VALUES (?,?,?,?,?)", [id, name, email, hashed, phone || null]);
    const token = jwt.sign({ id, name, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id, name, email, phone } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const db = await getDb();
    const user = await db.get("SELECT * FROM users WHERE email = ?", email);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: "Invalid email or password" });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/me", auth, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get("SELECT id, name, email, phone, created_at FROM users WHERE id = ?", req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch("/me", auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const db = await getDb();
    await db.run("UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?", [name || null, phone || null, req.user.id]);
    const updated = await db.get("SELECT id, name, email, phone FROM users WHERE id = ?", req.user.id);
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
