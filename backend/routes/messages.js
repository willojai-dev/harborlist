const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../db");
const { auth } = require("../middleware/auth");

router.post("/", async (req, res) => {
  try {
    const { listing_id, sender_name, sender_email, body } = req.body;
    if (!listing_id || !sender_name || !sender_email || !body) return res.status(400).json({ error: "All fields required" });
    const db = await getDb();
    const listing = await db.get("SELECT id FROM listings WHERE id = ?", listing_id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    const id = uuidv4();
    await db.run("INSERT INTO messages (id, listing_id, sender_name, sender_email, body) VALUES (?,?,?,?,?)", [id, listing_id, sender_name, sender_email, body]);
    res.status(201).json({ id, message: "Message sent!" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/", auth, async (req, res) => {
  try {
    const db = await getDb();
    const messages = await db.all(`
      SELECT m.*, l.name as listing_name FROM messages m
      JOIN listings l ON m.listing_id = l.id
      WHERE l.user_id = ? ORDER BY m.created_at DESC`, req.user.id);
    res.json(messages);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch("/:id/read", auth, async (req, res) => {
  try {
    const db = await getDb();
    const msg = await db.get(`SELECT m.* FROM messages m JOIN listings l ON m.listing_id = l.id WHERE m.id = ? AND l.user_id = ?`, [req.params.id, req.user.id]);
    if (!msg) return res.status(404).json({ error: "Message not found" });
    await db.run("UPDATE messages SET read = 1 WHERE id = ?", req.params.id);
    res.json({ updated: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
