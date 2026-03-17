import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, photoUrl } from "../api";
import { useAuth } from "../components/AuthContext";

const statusColor = { active: "#27ae60", sold: "#7f8c8d", draft: "#e67e22" };

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.listings.mine()
      .then(setListings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const deleteListing = async (id) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    await api.listings.delete(id);
    setListings(ls => ls.filter(l => l.id !== id));
  };

  if (loading) return <div style={{ textAlign: "center", padding: "6rem", color: "var(--muted)" }}><div style={{ fontSize: "2.5rem", animation: "float 1.5s ease-in-out infinite" }}>⚓</div></div>;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", color: "var(--navy)", marginBottom: "0.3rem" }}>My Listings</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Welcome back, {user?.name}</p>
        </div>
        <Link to="/listings/new" style={{
          background: "var(--ocean)", color: "white", padding: "11px 22px",
          borderRadius: "8px", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
        }}>+ New Listing</Link>
      </div>

      {listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem", background: "white", borderRadius: "var(--radius)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⛵</div>
          <h2 style={{ color: "var(--navy)", marginBottom: "0.5rem" }}>No listings yet</h2>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>List your first boat and reach thousands of buyers.</p>
          <Link to="/listings/new" style={{ background: "var(--ocean)", color: "white", padding: "12px 28px", borderRadius: "8px", fontWeight: 600, textDecoration: "none" }}>
            + List Your Boat
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {listings.map(listing => {
            const primary = listing.photos?.find(p => p.is_primary) || listing.photos?.[0];
            const imgUrl = primary ? photoUrl(primary.filename) : null;
            return (
              <div key={listing.id} style={{ background: "white", borderRadius: "var(--radius)", padding: "1.2rem", display: "flex", gap: "1.2rem", alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
                <div style={{
                  width: "90px", height: "68px", borderRadius: "8px", flexShrink: 0,
                  background: imgUrl ? `url(${imgUrl}) center/cover` : "linear-gradient(135deg, var(--navy), var(--ocean))",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem",
                }}>
                  {!imgUrl && (listing.type === "Sailboat" ? "⛵" : "🚤")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <h3 style={{ fontSize: "1rem", color: "var(--navy)", fontFamily: "'Playfair Display', serif" }}>{listing.name}</h3>
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: statusColor[listing.status] + "22", color: statusColor[listing.status] }}>
                      {listing.status}
                    </span>
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                    {listing.type} · {listing.length}ft · {listing.year} · 📍 {listing.location}
                  </div>
                  <div style={{ color: "var(--ocean)", fontWeight: 700, fontSize: "1rem", marginTop: "4px" }}>
                    ${Number(listing.price).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <Link to={`/listings/${listing.id}`} style={{ padding: "7px 14px", border: "1px solid var(--border)", borderRadius: "7px", fontSize: "0.82rem", color: "var(--navy)", fontWeight: 500, textDecoration: "none" }}>View</Link>
                  <Link to={`/listings/${listing.id}/edit`} style={{ padding: "7px 14px", border: "1px solid var(--ocean)", borderRadius: "7px", fontSize: "0.82rem", color: "var(--ocean)", fontWeight: 500, textDecoration: "none" }}>Edit</Link>
                  <button onClick={() => deleteListing(listing.id)} style={{ padding: "7px 14px", border: "1px solid #e74c3c", borderRadius: "7px", fontSize: "0.82rem", color: "#e74c3c", fontWeight: 500, background: "none", cursor: "pointer" }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
