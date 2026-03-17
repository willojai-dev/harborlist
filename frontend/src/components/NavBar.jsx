import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useState } from "react";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link to={to} style={{
      color: isActive(to) ? "var(--gold)" : "rgba(255,255,255,0.75)",
      fontWeight: 500,
      fontSize: "0.9rem",
      letterSpacing: "0.3px",
      transition: "color 0.2s",
      textDecoration: "none",
    }}>{label}</Link>
  );

  return (
    <nav style={{
      background: "linear-gradient(135deg, var(--deep) 0%, var(--navy) 100%)",
      padding: "0 2rem",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 200,
      boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <span style={{ fontSize: "1.5rem" }}>⚓</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.35rem", fontWeight: 700, color: "white" }}>
          Harbor<span style={{ color: "var(--gold)" }}>List</span>
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "1.8rem" }}>
        {navLink("/listings", "Browse Boats")}
        {user ? (
          <>
            {navLink("/dashboard", "My Listings")}
            {navLink("/inbox", "Inbox")}
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(o => !o)} style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "white",
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}>
                👤 {user.name.split(" ")[0]} ▾
              </button>
              {menuOpen && (
                <div onClick={() => setMenuOpen(false)} style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "white",
                  borderRadius: "10px",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                  minWidth: "160px",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}>
                  {[
                    { label: "My Listings", to: "/dashboard" },
                    { label: "Inbox", to: "/inbox" },
                    { label: "List a Boat", to: "/listings/new" },
                  ].map(({ label, to }) => (
                    <Link key={to} to={to} style={{
                      display: "block",
                      padding: "11px 16px",
                      fontSize: "0.9rem",
                      color: "var(--text)",
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--foam)"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                    >{label}</Link>
                  ))}
                  <button onClick={() => { logout(); navigate("/"); }} style={{
                    display: "block",
                    width: "100%",
                    padding: "11px 16px",
                    fontSize: "0.9rem",
                    color: "#c0392b",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}>Sign Out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {navLink("/login", "Sign In")}
            <Link to="/register" style={{
              background: "var(--gold)",
              color: "var(--deep)",
              padding: "8px 18px",
              borderRadius: "7px",
              fontWeight: 600,
              fontSize: "0.85rem",
              textDecoration: "none",
            }}>List Your Boat</Link>
          </>
        )}
      </div>
    </nav>
  );
}
