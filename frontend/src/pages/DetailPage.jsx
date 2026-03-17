import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, photoUrl } from "../api";
import { useAuth } from "../components/AuthContext";
import ListingMap from "../components/ListingMap";
import BoatCard from "../components/BoatCard";

function SpecSection({ title, children }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h3 style={{ fontSize: "1rem", color: "var(--navy)", fontFamily: "'Playfair Display', serif", marginBottom: "0.8rem", paddingBottom: "6px", borderBottom: "2px solid var(--foam)" }}>{title}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
        {children}
      </div>
    </div>
  );
}

function SpecRow({ label, value, unit = "" }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "0.6rem" }}>
      <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>{value}{unit ? ` ${unit}` : ""}</div>
    </div>
  );
}

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [msgForm, setMsgForm] = useState({ name: "", email: "", body: "" });
  const [msgSent, setMsgSent] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [sending, setSending] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    api.listings.get(id)
      .then(b => {
        setBoat(b);
        setMsgForm(f => ({ ...f, name: user?.name || "", email: user?.email || "" }));
        // Fetch similar listings — same type, exclude current
        api.listings.list({ type: b.type, limit: 4 })
          .then(d => setSimilar(d.listings.filter(l => l.id !== id).slice(0, 3)))
          .catch(() => {});
      })
      .catch(() => navigate("/listings"))
      .finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async () => {
    if (!msgForm.name || !msgForm.email || !msgForm.body) { setMsgError("All fields required"); return; }
    setSending(true);
    try {
      await api.messages.send({ listing_id: id, ...msgForm });
      setMsgSent(true); setMsgError("");
    } catch (e) { setMsgError(e.message); }
    finally { setSending(false); }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "6rem", color: "var(--muted)" }}><div style={{ fontSize: "3rem", animation: "float 1.5s ease-in-out infinite" }}>⚓</div></div>;
  if (!boat) return null;

  const photos = boat.photos || [];
  const currentPhoto = photos[activePhoto];
  const imgUrl = currentPhoto ? photoUrl(currentPhoto.filename) : null;

  const prevPhoto = () => setActivePhoto(i => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setActivePhoto(i => (i + 1) % photos.length);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "var(--ocean)", cursor: "pointer", fontWeight: 500, fontSize: "0.9rem", marginBottom: "1.5rem", padding: 0 }}>
        ← Back
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem", alignItems: "start" }}>
        {/* Left */}
        <div>
          {/* Photo carousel */}
          <div style={{ position: "relative", marginBottom: "10px", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <div style={{
              height: "380px",
              background: imgUrl ? `url(${imgUrl}) center/cover` : "linear-gradient(135deg, var(--navy), var(--ocean))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "7rem",
              transition: "background-image 0.3s ease",
            }}>
              {!imgUrl && (boat.type === "Sailboat" ? "⛵" : "🚤")}
            </div>
            {/* Prev/Next arrows */}
            {photos.length > 1 && (
              <>
                <button onClick={prevPhoto} style={{
                  position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.45)", color: "white", border: "none",
                  borderRadius: "50%", width: "40px", height: "40px", fontSize: "1.1rem",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)", transition: "background 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}
                >‹</button>
                <button onClick={nextPhoto} style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.45)", color: "white", border: "none",
                  borderRadius: "50%", width: "40px", height: "40px", fontSize: "1.1rem",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)", transition: "background 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}
                >›</button>
                {/* Dot indicators */}
                <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px" }}>
                  {photos.map((_, i) => (
                    <div key={i} onClick={() => setActivePhoto(i)} style={{
                      width: i === activePhoto ? "20px" : "8px", height: "8px",
                      borderRadius: "4px", background: i === activePhoto ? "var(--gold)" : "rgba(255,255,255,0.6)",
                      cursor: "pointer", transition: "all 0.2s",
                    }} />
                  ))}
                </div>
                {/* Counter */}
                <div style={{
                  position: "absolute", top: "12px", right: "12px",
                  background: "rgba(0,0,0,0.5)", color: "white", borderRadius: "20px",
                  padding: "3px 10px", fontSize: "0.78rem", backdropFilter: "blur(4px)",
                }}>
                  {activePhoto + 1} / {photos.length}
                </div>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {photos.length > 1 && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "4px" }}>
              {photos.map((p, i) => (
                <div key={p.id} onClick={() => setActivePhoto(i)} style={{
                  width: "80px", height: "60px", flexShrink: 0,
                  background: `url(${photoUrl(p.filename)}) center/cover`,
                  borderRadius: "6px", cursor: "pointer",
                  border: i === activePhoto ? "2px solid var(--gold)" : "2px solid transparent",
                  opacity: i === activePhoto ? 1 : 0.7,
                  transition: "all 0.15s",
                }} />
              ))}
            </div>
          )}

          {/* Description */}
          <div style={{ background: "white", borderRadius: "var(--radius)", padding: "1.8rem", boxShadow: "var(--shadow-sm)", marginBottom: "1.5rem", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "1.2rem", color: "var(--navy)", marginBottom: "1rem" }}>About this Boat</h2>
            <p style={{ color: "#4a5568", lineHeight: 1.75, fontSize: "0.95rem" }}>{boat.description || "No description provided."}</p>
          </div>

          {/* Specs */}
          <div style={{ background: "white", borderRadius: "var(--radius)", padding: "1.8rem", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "1.2rem", color: "var(--navy)", marginBottom: "1.2rem" }}>Specifications</h2>

            <SpecSection title="Overview">
              <SpecRow label="Type" value={boat.type} />
              <SpecRow label="Category" value={boat.category} />
              <SpecRow label="Year" value={boat.year} />
              <SpecRow label="Condition" value={boat.condition} />
              <SpecRow label="Location" value={boat.location} />
              <SpecRow label="Capacity" value={boat.capacity} unit="persons" />
            </SpecSection>

            <SpecSection title="Dimensions">
              <SpecRow label="Length Overall" value={boat.length} unit="ft" />
              <SpecRow label="Beam" value={boat.beam} unit="ft" />
              <SpecRow label="Max Draft" value={boat.draft} unit="ft" />
              <SpecRow label="Hull Material" value={boat.hull_material} />
            </SpecSection>

            <SpecSection title="Propulsion">
              <SpecRow label="Engine Make" value={boat.engine_make} />
              <SpecRow label="Engine Model" value={boat.engine_model} />
              <SpecRow label="Total Power" value={boat.total_power} />
              <SpecRow label="Fuel Type" value={boat.fuel_type} />
              <SpecRow label="Engine Hours" value={boat.engine_hours} unit="hrs" />
            </SpecSection>

            <SpecSection title="Tanks">
              <SpecRow label="Fuel Tank" value={boat.fuel_tank} unit="gal" />
              <SpecRow label="Fresh Water Tank" value={boat.water_tank} unit="gal" />
              <SpecRow label="Holding Tank" value={boat.holding_tank} unit="gal" />
            </SpecSection>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ position: "sticky", top: "80px" }}>
          <div style={{ background: "white", borderRadius: "var(--radius)", padding: "1.8rem", boxShadow: "var(--shadow-md)", border: "1px solid var(--border)", marginBottom: "1rem" }}>
            <h1 style={{ fontSize: "1.4rem", color: "var(--navy)", marginBottom: "4px" }}>{boat.name}</h1>
            <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              {boat.type}{boat.category ? ` · ${boat.category}` : ""} · {boat.length}ft · {boat.year}
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--ocean)", fontFamily: "'Playfair Display', serif", marginBottom: "1.2rem" }}>
              ${Number(boat.price).toLocaleString()}
            </div>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "1.2rem" }}>
              {[
                ["📏", `${boat.length}ft`, "Length"],
                ["📅", boat.year, "Year"],
                boat.engine_hours ? ["⏱️", `${boat.engine_hours}hrs`, "Eng. Hours"] : null,
                boat.fuel_type ? ["⛽", boat.fuel_type, "Fuel"] : null,
              ].filter(Boolean).map(([icon, val, label]) => (
                <div key={label} style={{ background: "var(--foam)", borderRadius: "8px", padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.1rem" }}>{icon}</div>
                  <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9rem" }}>{val}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.7rem" }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--foam)", borderRadius: "8px", padding: "1rem", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ fontSize: "2rem" }}>👤</div>
              <div>
                <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>{boat.seller_name}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{boat.location}</div>
                {boat.seller_phone && <div style={{ color: "var(--ocean)", fontSize: "0.82rem", marginTop: "2px" }}>📞 {boat.seller_phone}</div>}
              </div>
            </div>

            {user?.id === boat.user_id ? (
              <button onClick={() => navigate(`/listings/${id}/edit`)} style={{ width: "100%", padding: "13px", background: "var(--navy)", border: "none", borderRadius: "8px", color: "white", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer" }}>
                ✏️ Edit This Listing
              </button>
            ) : (
              <button onClick={() => setContactOpen(o => !o)} style={{ width: "100%", padding: "13px", background: "var(--ocean)", border: "none", borderRadius: "8px", color: "white", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", marginBottom: "4px" }}>
                ✉️ Contact Seller
              </button>
            )}

            {contactOpen && !msgSent && (
              <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--foam)", borderRadius: "8px", border: "1px solid rgba(26,107,138,0.15)" }}>
                {[["Your Name", "name", "text"], ["Your Email", "email", "email"]].map(([ph, k, t]) => (
                  <input key={k} type={t} placeholder={ph} value={msgForm[k]} onChange={e => setMsgForm(f => ({ ...f, [k]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 11px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "8px", outline: "none" }} />
                ))}
                <textarea rows={3} placeholder={`Hi, I'm interested in the ${boat.name}…`} value={msgForm.body} onChange={e => setMsgForm(f => ({ ...f, body: e.target.value }))}
                  style={{ width: "100%", padding: "9px 11px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "6px", fontSize: "0.85rem", resize: "vertical", outline: "none", marginBottom: "8px" }} />
                {msgError && <p style={{ color: "#c0392b", fontSize: "0.8rem", marginBottom: "6px" }}>{msgError}</p>}
                <button onClick={sendMessage} disabled={sending} style={{ width: "100%", padding: "10px", background: "var(--navy)", border: "none", borderRadius: "6px", color: "white", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                  {sending ? "Sending…" : "Send Message"}
                </button>
              </div>
            )}
            {msgSent && (
              <div style={{ marginTop: "1rem", padding: "1rem", background: "#eafaf1", borderRadius: "8px", border: "1px solid #27ae60", color: "#1e8449", fontSize: "0.9rem", textAlign: "center" }}>
                ✅ Message sent! The seller will be in touch.
              </div>
            )}
          </div>
        </div>
        <ListingMap lat={boat.lat} lng={boat.lng} location={boat.location} />
      </div>

      {/* Similar listings */}
      {similar.length > 0 && (
        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.5rem", color: "var(--navy)", marginBottom: "0.3rem" }}>Similar Listings</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
            Other {boat.type.toLowerCase()}s you might like
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.4rem" }}>
            {similar.map(b => <BoatCard key={b.id} boat={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}
