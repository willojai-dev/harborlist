import { Link } from "react-router-dom";
import { photoUrl } from "../api";
import { useState } from "react";

const conditionColor = { "Like New": "#27ae60", "Excellent": "#1a6b8a", "Good": "#7f8c8d", "Fair": "#e67e22", "Project": "#c0392b" };

export default function BoatCard({ boat }) {
  const [hovered, setHovered] = useState(false);
  const primaryPhoto = boat.photos?.find(p => p.is_primary) || boat.photos?.[0];
  const imgUrl = primaryPhoto ? photoUrl(primaryPhoto.filename) : null;

  return (
    <Link to={`/listings/${boat.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        background: "white",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        boxShadow: hovered ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "all 0.25s ease",
        textDecoration: "none",
        border: "1px solid var(--border)",
      }}>
      {/* Photo with fallback */}
      <div style={{ height: "180px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, var(--navy), var(--ocean))" }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={boat.name}
            onError={e => { e.target.style.display = "none"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4.5rem" }}>
            {boat.type === "Sailboat" ? "⛵" : "🚤"}
          </div>
        )}
        {/* Condition badge */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: conditionColor[boat.condition] || "#7f8c8d",
          color: "white", padding: "3px 10px", borderRadius: "20px",
          fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.4px",
        }}>{boat.condition}</div>
        {/* Photo count */}
        {boat.photos?.length > 1 && (
          <div style={{
            position: "absolute", bottom: 10, right: 10,
            background: "rgba(0,0,0,0.5)", color: "white",
            padding: "2px 8px", borderRadius: "20px", fontSize: "0.7rem",
          }}>📷 {boat.photos.length}</div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: "1.1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--navy)", fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>
            {boat.name}
          </h3>
          <span style={{ color: "var(--ocean)", fontWeight: 700, fontSize: "1rem", whiteSpace: "nowrap", marginLeft: "8px" }}>
            ${Number(boat.price).toLocaleString()}
          </span>
        </div>
        <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginBottom: "8px" }}>
          {boat.type} · {boat.length}ft · {boat.year}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--muted)", fontSize: "0.82rem" }}>
          📍 {boat.location}
        </div>
      </div>
    </Link>
  );
}
