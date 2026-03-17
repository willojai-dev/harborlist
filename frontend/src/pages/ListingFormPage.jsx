import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, photoUrl } from "../api";
import { useAuth } from "../components/AuthContext";

const TYPES = ["Sailboat", "Motorboat", "Yacht", "Pontoon", "Catamaran", "Other"];
const CONDITIONS = ["Like New", "Excellent", "Good", "Fair", "Project"];
const FUEL_TYPES = ["Diesel", "Gasoline", "Electric", "Hybrid", "Other"];
const HULL_MATERIALS = ["Fiberglass", "Aluminum", "Steel", "Wood", "Carbon Fiber", "Ferrocement", "Other"];
const CATEGORIES = ["Cruiser", "Bluewater Cruiser", "Racer-Cruiser", "Sport Fishing", "Sport Yacht", "Bowrider", "Pontoon", "Multihull", "Motorsailer", "Daysailer", "Other"];

const inputSt = { width: "100%", padding: "10px 13px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "8px", fontSize: "0.9rem", outline: "none", background: "white" };
const labelSt = { fontSize: "0.72rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: "5px" };

const Field = ({ label, children }) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={labelSt}>{label}</label>
    {children}
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ background: "white", borderRadius: "12px", padding: "2rem", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", marginBottom: "1.5rem" }}>
    <h2 style={{ fontSize: "1.1rem", color: "var(--navy)", marginBottom: "1.5rem", paddingBottom: "8px", borderBottom: "2px solid var(--foam)" }}>{title}</h2>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>{children}</div>
);

export default function ListingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const blank = { name: "", type: "Sailboat", price: "", length: "", beam: "", draft: "", year: new Date().getFullYear(), condition: "Excellent", category: "", hull_material: "", engine_make: "", engine_model: "", total_power: "", fuel_type: "Diesel", engine_hours: "", fuel_tank: "", water_tank: "", holding_tank: "", capacity: "", description: "", location: "", lat: "", lng: "", status: "active" };
  const [form, setForm] = useState(blank);
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (isEdit) {
      api.listings.get(id).then(l => {
        if (l.user_id !== user.id) { navigate("/dashboard"); return; }
        const f = {};
        Object.keys(blank).forEach(k => { f[k] = l[k] ?? ""; });
        setForm(f);
        setExistingPhotos(l.photos || []);
      });
    }
  }, [id, user]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const num = (v) => v === "" ? null : Number(v);

  const handleSubmit = async () => {
    setError(""); setSaving(true);
    try {
      const payload = {
        ...form,
        price: num(form.price), length: num(form.length), beam: num(form.beam),
        draft: num(form.draft), year: num(form.year), engine_hours: num(form.engine_hours),
        fuel_tank: num(form.fuel_tank), water_tank: num(form.water_tank),
        holding_tank: num(form.holding_tank), capacity: num(form.capacity),
        lat: num(form.lat), lng: num(form.lng),
      };
      let listing = isEdit ? await api.listings.update(id, payload) : await api.listings.create(payload);
      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach(f => fd.append("photos", f));
        await api.listings.uploadPhotos(listing.id, fd);
      }
      navigate(`/listings/${listing.id}`);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const deleteExistingPhoto = async (photoId) => {
    if (!window.confirm("Delete this photo?")) return;
    await api.listings.deletePhoto(id, photoId);
    setExistingPhotos(ps => ps.filter(p => p.id !== photoId));
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.9rem", color: "var(--navy)", marginBottom: "0.3rem" }}>{isEdit ? "Edit Listing" : "List Your Boat"}</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>Fill in as much detail as possible — better listings get more inquiries.</p>

      <Section title="Basic Information">
        <Field label="Listing Title *"><input style={inputSt} placeholder="e.g. Beneteau Oceanis 35" value={form.name} onChange={set("name")} /></Field>
        <Grid>
          <Field label="Boat Type *"><select style={inputSt} value={form.type} onChange={set("type")}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Category"><select style={inputSt} value={form.category} onChange={set("category")}><option value="">Select…</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Condition *"><select style={inputSt} value={form.condition} onChange={set("condition")}>{CONDITIONS.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Year *"><input style={inputSt} type="number" placeholder="e.g. 2018" value={form.year} onChange={set("year")} /></Field>
          <Field label="Price (USD) *"><input style={inputSt} type="number" placeholder="e.g. 75000" value={form.price} onChange={set("price")} /></Field>
          <Field label="Capacity (persons)"><input style={inputSt} type="number" placeholder="e.g. 6" value={form.capacity} onChange={set("capacity")} /></Field>
        </Grid>
        <Field label="Description">
          <textarea style={{ ...inputSt, resize: "vertical" }} rows={5} placeholder="Describe your boat's history, upgrades, condition, and what makes it special…" value={form.description} onChange={set("description")} />
        </Field>
      </Section>

      <Section title="Dimensions">
        <Grid>
          <Field label="Length Overall (ft) *"><input style={inputSt} type="number" step="0.1" placeholder="e.g. 36.5" value={form.length} onChange={set("length")} /></Field>
          <Field label="Beam (ft)"><input style={inputSt} type="number" step="0.1" placeholder="e.g. 12.0" value={form.beam} onChange={set("beam")} /></Field>
          <Field label="Max Draft (ft)"><input style={inputSt} type="number" step="0.1" placeholder="e.g. 5.5" value={form.draft} onChange={set("draft")} /></Field>
          <Field label="Hull Material"><select style={inputSt} value={form.hull_material} onChange={set("hull_material")}><option value="">Select…</option>{HULL_MATERIALS.map(m => <option key={m}>{m}</option>)}</select></Field>
        </Grid>
      </Section>

      <Section title="Propulsion">
        <Grid>
          <Field label="Engine Make"><input style={inputSt} placeholder="e.g. Yanmar" value={form.engine_make} onChange={set("engine_make")} /></Field>
          <Field label="Engine Model"><input style={inputSt} placeholder="e.g. 4JH45" value={form.engine_model} onChange={set("engine_model")} /></Field>
          <Field label="Total Power"><input style={inputSt} placeholder="e.g. 45hp" value={form.total_power} onChange={set("total_power")} /></Field>
          <Field label="Fuel Type"><select style={inputSt} value={form.fuel_type} onChange={set("fuel_type")}><option value="">Select…</option>{FUEL_TYPES.map(f => <option key={f}>{f}</option>)}</select></Field>
          <Field label="Engine Hours"><input style={inputSt} type="number" placeholder="e.g. 450" value={form.engine_hours} onChange={set("engine_hours")} /></Field>
        </Grid>
      </Section>

      <Section title="Tanks (gallons)">
        <Grid>
          <Field label="Fuel Tank (gal)"><input style={inputSt} type="number" placeholder="e.g. 50" value={form.fuel_tank} onChange={set("fuel_tank")} /></Field>
          <Field label="Fresh Water Tank (gal)"><input style={inputSt} type="number" placeholder="e.g. 80" value={form.water_tank} onChange={set("water_tank")} /></Field>
          <Field label="Holding Tank (gal)"><input style={inputSt} type="number" placeholder="e.g. 20" value={form.holding_tank} onChange={set("holding_tank")} /></Field>
        </Grid>
      </Section>

      <Section title="Location">
        <Field label="Location *"><input style={inputSt} placeholder="e.g. Ventura Harbor, CA" value={form.location} onChange={set("location")} /></Field>
        <Grid>
          <Field label="Latitude (optional)"><input style={inputSt} type="number" step="0.001" placeholder="e.g. 34.228" value={form.lat} onChange={set("lat")} /></Field>
          <Field label="Longitude (optional)"><input style={inputSt} type="number" step="0.001" placeholder="e.g. -119.274" value={form.lng} onChange={set("lng")} /></Field>
        </Grid>
      </Section>

      <Section title="Photos">
        {existingPhotos.length > 0 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "1rem" }}>
            {existingPhotos.map(p => (
              <div key={p.id} style={{ position: "relative" }}>
                <img src={`/uploads/${p.filename}`} alt="" style={{ width: "90px", height: "68px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border)" }} />
                <button onClick={() => deleteExistingPhoto(p.id)} style={{ position: "absolute", top: -6, right: -6, background: "#c0392b", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "11px" }}>✕</button>
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/*" multiple onChange={e => setPhotos(Array.from(e.target.files))} style={{ fontSize: "0.9rem", color: "var(--muted)" }} />
        {photos.length > 0 && <p style={{ color: "var(--ocean)", fontSize: "0.85rem", marginTop: "8px" }}>📷 {photos.length} photo{photos.length > 1 ? "s" : ""} selected</p>}
      </Section>

      {isEdit && (
        <Section title="Status">
          <Field label="Listing Status">
            <select style={{ ...inputSt, width: "auto" }} value={form.status} onChange={set("status")}>
              {["active", "sold", "draft"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </Field>
        </Section>
      )}

      {error && <p style={{ color: "#c0392b", fontSize: "0.9rem", background: "#fdecea", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={handleSubmit} disabled={saving} style={{ padding: "13px 32px", background: "var(--ocean)", border: "none", borderRadius: "8px", color: "white", fontWeight: 600, fontSize: "1rem", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Publish Listing"}
        </button>
        <button onClick={() => navigate(-1)} style={{ padding: "13px 24px", background: "white", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--muted)", fontWeight: 500, fontSize: "0.95rem", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
