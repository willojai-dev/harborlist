import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, photoUrl } from "../api";
import { useAuth } from "../components/AuthContext";
import ListingMap from "../components/ListingMap";
import BoatCard from "../components/BoatCard";

function SpecRow({ label, value, unit = "" }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "7px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
      <span style={{ fontSize: "0.85rem", color: "var(--muted)", minWidth: "130px" }}>{label}:</span>
      <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--navy)", textAlign: "right" }}>{value}{unit ? ` ${unit}` : ""}</span>
    </div>
  );
}

function SpecGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const hasContent = React.Children.toArray(children).some(c => c);
  if (!hasContent) return null;
  return (
    <div style={{ marginBottom: "0" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 0", background: "none", border: "none", cursor: "pointer",
        borderBottom: "2px solid var(--foam)",
      }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "var(--navy)" }}>{title}</span>
        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div style={{ paddingTop: "4px", paddingBottom: "12px" }}>{children}</div>}
    </div>
  );
}

function SpecsPanel({ boat }) {
  return (
    <div style={{ background: "white", borderRadius: "var(--radius)", padding: "1.8rem", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
      <h2 style={{ fontSize: "1.2rem", color: "var(--navy)", marginBottom: "1.2rem" }}>Specifications</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        <SpecGroup title="Overview">
          <SpecRow label="Type" value={boat.type} />
          <SpecRow label="Category" value={boat.category} />
          <SpecRow label="Year" value={boat.year} />
          <SpecRow label="Condition" value={boat.condition} />
          <SpecRow label="Hull Material" value={boat.hull_material} />
          <SpecRow label="Location" value={boat.location} />
        </SpecGroup>
        <SpecGroup title="Dimensions">
          <SpecRow label="Length Overall" value={boat.length} unit="ft" />
          <SpecRow label="Beam" value={boat.beam} unit="ft" />
          <SpecRow label="Max Draft" value={boat.draft} unit="ft" />
        </SpecGroup>
        <SpecGroup title="Engine">
          <SpecRow label="Engine Make" value={boat.engine_make} />
          <SpecRow label="Engine Model" value={boat.engine_model} />
          <SpecRow label="Engine Type" value={boat.engine_type} />
          <SpecRow label="Total Power" value={boat.total_power} />
          <SpecRow label="Fuel Type" value={boat.fuel_type} />
          <SpecRow label="Engine Hours" value={boat.engine_hours} unit="hrs" />
        </SpecGroup>
        <SpecGroup title="Tanks">
          <SpecRow label="Fuel Tank" value={boat.fuel_tank} unit="gal" />
          <SpecRow label="Fresh Water" value={boat.water_tank} unit="gal" />
          <SpecRow label="Holding Tank" value={boat.holding_tank} unit="gal" />
        </SpecGroup>
        <SpecGroup title="Accommodations">
          <SpecRow label="Cabins" value={boat.cabins} />
          <SpecRow label="Heads" value={boat.heads} />
          <SpecRow label="Berths" value={boat.berths} />
          <SpecRow label="Capacity" value={boat.capacity} unit="persons" />
        </SpecGroup>
      </div>
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
  const [lightbox, setLightbox] = useState(false);
  const [msgForm, setMsgForm] = useState({ name: "", email: "", body: "" });
  const [msgSent, setMsgSent] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [sending, setSending] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [similar, setSimilar] = useState([]);
  const photosRef = useRef([]);

  useEffect(() => {
    api.listings.get(id)
      .then(b => {
        setBoat(b);
        photosRef.current = b.photos || [];
        setMsgForm(f => ({ ...f, name: user?.name || "", email: user?.email || "" }));
        api.listings.list({ type: b.type, limit: 4 })
          .then(d => setSimilar(d.listings.filter(l => l.id !== id).slice(0, 3)))
          .catch(() => {});
      })
      .catch(() => navigate("/listings"))
      .finally(() => setLoading(false));
  }, [id]);

  // Keyboard navigation — uses ref so no timing issues
  useEffect(() => {
    const handler = (e) => {
      const len = photosRef.current.length;
      if (!len) return;
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActivePhoto(i => (i + 1) % len);
      if (e.key === "ArrowLeft") setActivePhoto(i => (i - 1 + len) % len);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const sendMessage = async () => {
    if (!msgForm.name || !msgForm.email || !msgForm.body) { setMsgError("All fields required"); return; }
    setSending(true);
    try {
      await api.messages.send({ listing_id: id, sender_name: msgForm.name, sender_email: msgForm.email, body: msgForm.body });
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
    <div className="page-pad" style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "var(--ocean)", cursor: "pointer", fontWeight: 500, fontSize: "0.9rem", marginBottom: "1.5rem", padding: 0 }}>
        ← Back
      </button>

      {/* Lightbox */}
      {lightbox && imgUrl && (
        <div onClick={() => setLightbox(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "zoom-out",
        }}>
          <img
            src={imgUrl} alt={boat.name}
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: "88vh", maxWidth: "88vw", objectFit: "contain", borderRadius: "8px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", cursor: "default" }}
          />
          <button onClick={() => setLightbox(false)} style={{
            position: "absolute", top: "20px", right: "24px",
            background: "rgba(255,255,255,0.15)", border: "none", color: "white",
            borderRadius: "50%", width: "44px", height: "44px", fontSize: "1.4rem",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}>✕</button>
          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prevPhoto(); }} style={{
                position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.15)", border: "none", color: "white",
                borderRadius: "50%", width: "52px", height: "52px", fontSize: "1.8rem",
                cursor: "pointer", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>‹</button>
              <button onClick={e => { e.stopPropagation(); nextPhoto(); }} style={{
                position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.15)", border: "none", color: "white",
                borderRadius: "50%", width: "52px", height: "52px", fontSize: "1.8rem",
                cursor: "pointer", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>›</button>
            </>
          )}
          <div style={{
            position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)", color: "white", borderRadius: "20px",
            padding: "6px 16px", fontSize: "0.85rem", backdropFilter: "blur(4px)",
            display: "flex", gap: "8px", alignItems: "center",
          }}>
            {photos.map((_, i) => (
              <div key={i} onClick={e => { e.stopPropagation(); setActivePhoto(i); }} style={{
                width: i === activePhoto ? "20px" : "8px", height: "8px",
                borderRadius: "4px", background: i === activePhoto ? "var(--gold)" : "rgba(255,255,255,0.5)",
                cursor: "pointer", transition: "all 0.2s",
              }} />
            ))}
            <span style={{ marginLeft: "6px", opacity: 0.8 }}>{activePhoto + 1} / {photos.length}</span>
          </div>
        </div>
      )}

      <div className="detail-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem", alignItems: "start" }}>
        {/* Left */}
        <div>
          {/* Photo carousel */}
          <div style={{ position: "relative", marginBottom: "10px", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <div
              onClick={() => imgUrl && setLightbox(true)}
              style={{
                height: "380px",
                background: imgUrl ? `url(${imgUrl}) center/cover` : "linear-gradient(135deg, var(--navy), var(--ocean))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "7rem",
                cursor: imgUrl ? "zoom-in" : "default",
                transition: "background-image 0.3s ease",
              }}
            >
              {!imgUrl && (boat.type === "Sailboat" ? "⛵" : "🚤")}
            </div>

            {photos.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); prevPhoto(); }} style={{
                  position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.45)", color: "white", border: "none",
                  borderRadius: "50%", width: "40px", height: "40px", fontSize: "1.2rem",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)",
                }}>‹</button>
                <button onClick={e => { e.stopPropagation(); nextPhoto(); }} style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.45)", color: "white", border: "none",
                  borderRadius: "50%", width: "40px", height: "40px", fontSize: "1.2rem",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)",
                }}>›</button>

                {/* Bottom bar: dots + counter + expand hint */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
                  padding: "20px 14px 10px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}>
                  {photos.map((_, i) => (
                    <div key={i} onClick={() => setActivePhoto(i)} style={{
                      width: i === activePhoto ? "20px" : "8px", height: "8px",
                      borderRadius: "4px", background: i === activePhoto ? "var(--gold)" : "rgba(255,255,255,0.6)",
                      cursor: "pointer", transition: "all 0.2s",
                    }} />
                  ))}
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.78rem", marginLeft: "6px" }}>
                    {activePhoto + 1} / {photos.length}
                  </span>
                </div>
              </>
            )}

            {/* Expand hint */}
            {imgUrl && (
              <div style={{
                position: "absolute", top: "12px", right: "12px",
                background: "rgba(0,0,0,0.45)", color: "white",
                borderRadius: "6px", padding: "4px 10px", fontSize: "0.75rem",
                backdropFilter: "blur(4px)", cursor: "zoom-in", pointerEvents: "none",
              }}>
                ⛶ Click to expand
              </div>
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
                  opacity: i === activePhoto ? 1 : 0.65,
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
          <SpecsPanel boat={boat} />
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
            ) : !msgSent ? (
              <div>
                {/* Urgency badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "1rem", padding: "8px 12px", background: "#eafaf1", borderRadius: "8px", border: "1px solid #a8e6c1" }}>
                  <span style={{ fontSize: "0.85rem" }}>⚡</span>
                  <span style={{ fontSize: "0.8rem", color: "#1e8449", fontWeight: 500 }}>Typically responds within 24 hours</span>
                </div>

                {/* Always-visible contact form */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input type="text" placeholder="Your Name" value={msgForm.name} onChange={e => setMsgForm(f => ({ ...f, name: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "7px", fontSize: "0.88rem", outline: "none", fontFamily: "inherit" }} />
                  <input type="email" placeholder="Your Email" value={msgForm.email} onChange={e => setMsgForm(f => ({ ...f, email: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "7px", fontSize: "0.88rem", outline: "none", fontFamily: "inherit" }} />
                  <textarea rows={3}
                    placeholder={`Hi, I'm interested in the ${boat.name}. Is it still available?`}
                    value={msgForm.body} onChange={e => setMsgForm(f => ({ ...f, body: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "7px", fontSize: "0.88rem", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
                  {msgError && <p style={{ color: "#c0392b", fontSize: "0.8rem" }}>{msgError}</p>}
                  <button onClick={sendMessage} disabled={sending} style={{
                    width: "100%", padding: "13px", background: "var(--ocean)", border: "none",
                    borderRadius: "8px", color: "white", fontWeight: 700, fontSize: "1rem",
                    cursor: "pointer", opacity: sending ? 0.7 : 1, fontFamily: "inherit",
                    transition: "background 0.2s",
                  }}
                    onMouseEnter={e => !sending && (e.currentTarget.style.background = "var(--navy)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "var(--ocean)")}
                  >
                    {sending ? "Sending…" : "✉️ Send Message"}
                  </button>
                </div>

                {/* Trust signals */}
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "10px", flexWrap: "wrap" }}>
                  {["🔒 No spam", "📧 Direct to seller", "🆓 Free"].map(t => (
                    <span key={t} style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{t}</span>
                  ))}
                </div>

                {/* Phone CTA */}
                {boat.seller_phone && (
                  <div style={{ marginTop: "12px", textAlign: "center", fontSize: "0.82rem", color: "var(--muted)" }}>
                    Prefer to call? <a href={`tel:${boat.seller_phone}`} style={{ color: "var(--ocean)", fontWeight: 600, textDecoration: "none" }}>📞 {boat.seller_phone}</a>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: "1.2rem", background: "#eafaf1", borderRadius: "8px", border: "1px solid #27ae60", color: "#1e8449", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>✅</div>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>Message Sent!</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>The seller will be in touch within 24 hours.</div>
              </div>
            )}
          </div>
          <ListingMap lat={boat.lat} lng={boat.lng} location={boat.location} />
        </div>
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
