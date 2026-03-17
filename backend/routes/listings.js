const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../db");
const { auth, optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const path = require("path");
const fs = require("fs");

async function attachPhotos(db, listings) {
  const isArray = Array.isArray(listings);
  const items = isArray ? listings : [listings];
  if (!items.length) return listings;
  const ids = items.map(l => l.id);
  const placeholders = ids.map(() => "?").join(",");
  const photos = await db.all(`SELECT * FROM listing_photos WHERE listing_id IN (${placeholders}) ORDER BY sort_order`, ids);
  const photoMap = {};
  photos.forEach(p => { if (!photoMap[p.listing_id]) photoMap[p.listing_id] = []; photoMap[p.listing_id].push(p); });
  const result = items.map(l => ({ ...l, photos: photoMap[l.id] || [] }));
  return isArray ? result : result[0];
}

router.get("/", optionalAuth, async (req, res) => {
  try {
    const { search, type, condition, min_price, max_price, min_length, max_length, status = "active", limit = 50, offset = 0, sort = "created_at_desc" } = req.query;
    const db = await getDb();
    let where = ["l.status = ?"], params = [status];
    if (search) { const words = search.trim().toLowerCase().split(/[\s,]+/).filter(Boolean); words.forEach(w => { const s = `%${w}%`; where.push("(LOWER(l.name) LIKE ? OR LOWER(l.location) LIKE ? OR LOWER(l.description) LIKE ? OR LOWER(l.type) LIKE ? OR LOWER(COALESCE(l.category,'')) LIKE ?)"); params.push(s,s,s,s,s); }); }
    if (type) { where.push("l.type = ?"); params.push(type); }
    if (condition) { where.push("l.condition = ?"); params.push(condition); }
    if (min_price) { where.push("l.price >= ?"); params.push(parseInt(min_price)); }
    if (max_price) { where.push("l.price <= ?"); params.push(parseInt(max_price)); }
    if (min_length) { where.push("l.length >= ?"); params.push(parseFloat(min_length)); }
    if (max_length) { where.push("l.length <= ?"); params.push(parseFloat(max_length)); }
    const sortMap = { created_at_desc: "l.created_at DESC", created_at_asc: "l.created_at ASC", price_asc: "l.price ASC", price_desc: "l.price DESC", length_asc: "l.length ASC", year_desc: "l.year DESC" };
    const orderBy = sortMap[sort] || "l.created_at DESC";
    const whereClause = where.join(" AND ");
    const { count: total } = await db.get(`SELECT COUNT(*) as count FROM listings l WHERE ${whereClause}`, params);
    const rows = await db.all(`SELECT l.*, u.name as seller_name, u.phone as seller_phone FROM listings l JOIN users u ON l.user_id = u.id WHERE ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [...params, parseInt(limit), parseInt(offset)]);
    res.json({ total, listings: await attachPhotos(db, rows), limit: parseInt(limit), offset: parseInt(offset) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/mine", auth, async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all("SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC", req.user.id);
    res.json(await attachPhotos(db, rows));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get(`SELECT l.*, u.name as seller_name, u.email as seller_email, u.phone as seller_phone FROM listings l JOIN users u ON l.user_id = u.id WHERE l.id = ?`, req.params.id);
    if (!row) return res.status(404).json({ error: "Listing not found" });
    res.json(await attachPhotos(db, row));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, type, price, length, beam, draft, year, condition, category, hull_material, engine_make, engine_model, total_power, fuel_type, engine_hours, fuel_tank, water_tank, holding_tank, capacity, description, location, lat, lng, status = "active" } = req.body;
    if (!name || !type || !price || !length || !year || !condition || !location) return res.status(400).json({ error: "Missing required fields" });
    const db = await getDb();
    const id = uuidv4();
    await db.run(`INSERT INTO listings (id,user_id,name,type,price,length,beam,draft,year,condition,category,hull_material,engine_make,engine_model,total_power,fuel_type,engine_hours,fuel_tank,water_tank,holding_tank,capacity,description,location,lat,lng,status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, req.user.id, name, type, parseInt(price), parseFloat(length), beam||null, draft||null, parseInt(year), condition, category||null, hull_material||null, engine_make||null, engine_model||null, total_power||null, fuel_type||null, engine_hours||null, fuel_tank||null, water_tank||null, holding_tank||null, capacity||null, description||null, location, lat||null, lng||null, status]);
    res.status(201).json(await attachPhotos(db, await db.get("SELECT * FROM listings WHERE id = ?", id)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const db = await getDb();
    const listing = await db.get("SELECT * FROM listings WHERE id = ?", req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.user_id !== req.user.id) return res.status(403).json({ error: "Not your listing" });
    const fields = ["name","type","price","length","beam","draft","year","condition","category","hull_material","engine_make","engine_model","total_power","fuel_type","engine_hours","fuel_tank","water_tank","holding_tank","capacity","description","location","lat","lng","status"];
    const updates = [], vals = [];
    fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); vals.push(req.body[f]); } });
    if (!updates.length) return res.status(400).json({ error: "Nothing to update" });
    updates.push("updated_at = datetime('now')");
    await db.run(`UPDATE listings SET ${updates.join(", ")} WHERE id = ?`, [...vals, req.params.id]);
    res.json(await attachPhotos(db, await db.get("SELECT * FROM listings WHERE id = ?", req.params.id)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const db = await getDb();
    const listing = await db.get("SELECT * FROM listings WHERE id = ?", req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.user_id !== req.user.id) return res.status(403).json({ error: "Not your listing" });
    const photos = await db.all("SELECT filename FROM listing_photos WHERE listing_id = ?", req.params.id);
    photos.forEach(p => { const fp = path.join(__dirname, "..", "uploads", p.filename); if (fs.existsSync(fp)) fs.unlinkSync(fp); });
    await db.run("DELETE FROM listings WHERE id = ?", req.params.id);
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/:id/photos", auth, upload.array("photos", 10), async (req, res) => {
  try {
    const db = await getDb();
    const listing = await db.get("SELECT * FROM listings WHERE id = ?", req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.user_id !== req.user.id) return res.status(403).json({ error: "Not your listing" });
    if (!req.files?.length) return res.status(400).json({ error: "No files uploaded" });
    const { count: existingCount } = await db.get("SELECT COUNT(*) as count FROM listing_photos WHERE listing_id = ?", req.params.id);
    const photos = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const id = uuidv4();
      const isPrimary = existingCount === 0 && i === 0 ? 1 : 0;
      await db.run("INSERT INTO listing_photos (id,listing_id,filename,is_primary,sort_order) VALUES (?,?,?,?,?)", [id, req.params.id, file.filename, isPrimary, existingCount + i]);
      photos.push({ id, listing_id: req.params.id, filename: file.filename, is_primary: isPrimary });
    }
    res.status(201).json(photos);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete("/:id/photos/:photoId", auth, async (req, res) => {
  try {
    const db = await getDb();
    const listing = await db.get("SELECT * FROM listings WHERE id = ?", req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.user_id !== req.user.id) return res.status(403).json({ error: "Not your listing" });
    const photo = await db.get("SELECT * FROM listing_photos WHERE id = ? AND listing_id = ?", [req.params.photoId, req.params.id]);
    if (!photo) return res.status(404).json({ error: "Photo not found" });
    const fp = path.join(__dirname, "..", "uploads", photo.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    await db.run("DELETE FROM listing_photos WHERE id = ?", photo.id);
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
