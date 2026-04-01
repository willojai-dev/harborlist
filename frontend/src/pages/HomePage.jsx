import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import BoatCard from "../components/BoatCard";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.listings.list({ limit: 3, sort: "created_at_desc" })
      .then(d => setFeatured(d.listings))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(160deg, var(--deep) 0%, var(--navy) 50%, var(--ocean) 100%)",
        minHeight: "500px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ position: "absolute", bottom: i * 18, left: 0, right: 0, height: "2px", background: `rgba(42,157,181,${0.04 + i * 0.04})` }} />
        ))}
        <div style={{ fontSize: "4rem", marginBottom: "1rem", animation: "float 3s ease-in-out infinite" }}>⛵</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 5vw, 3.5rem)", color: "white", textAlign: "center", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem", maxWidth: "680px" }}>
          Tony Sucks at Coding, but he's kinda funny tho
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.05rem", textAlign: "center", maxWidth: "480px", marginBottom: "1rem", lineHeight: 1.7 }}>
          For real tho.
        </p>
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "2rem", flexWrap: "wrap" }}>
          <span>✔ No spam listings</span>
          <span>✔ Built for boats</span>
          <span>✔ Free to list</span>
        </div>
        <div className="search-box" style={{ display: "flex", background: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.3)", width: "100%", maxWidth: "520px" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && navigate(`/listings?search=${search}`)}
            placeholder="Search by name, type, or location..."
            style={{ flex: 1, padding: "16px 20px", border: "none", outline: "none", fontSize: "0.95rem" }}
          />
          <button onClick={() => navigate(`/listings?search=${search}`)} style={{
            background: "var(--ocean)", border: "none", color: "white",
            padding: "16px 24px", cursor: "pointer", fontWeight: 600, fontSize: "0.95rem", whiteSpace: "nowrap",
          }}>🔍 Search</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "var(--navy)", display: "flex", justifyContent: "center", gap: "4rem", padding: "1.2rem 2rem", flexWrap: "wrap" }}>
        {[["⛵", "Sailboats"], ["🚤", "Motorboats"], ["🗺️", "Nationwide"]].map(([icon, label]) => (
          <div key={label} style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>{icon}</span> {label}
          </div>
        ))}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div style={{ padding: "3rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.8rem", color: "var(--navy)", marginBottom: "0.4rem" }}>Featured Listings</h2>
          <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>Recently added by verified sellers</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {featured.map(boat => <BoatCard key={boat.id} boat={boat} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <button onClick={() => navigate("/listings")} style={{
              background: "var(--navy)", color: "white", border: "none",
              padding: "14px 36px", borderRadius: "8px", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer",
            }}>View All Listings →</button>
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ background: "var(--foam)", padding: "3rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.8rem", color: "var(--navy)", marginBottom: "0.8rem" }}>Ready to Sell Your Boat?</h2>
        <p style={{ color: "var(--muted)", marginBottom: "1.8rem", fontSize: "0.95rem" }}>Create a free listing and reach thousands of buyers.</p>
        <button onClick={() => navigate("/register")} style={{
          background: "var(--gold)", color: "var(--deep)", border: "none",
          padding: "14px 36px", borderRadius: "8px", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
        }}>+ List Your Boat Free</button>
      </div>
    </div>
  );
}
