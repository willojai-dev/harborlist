import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useState } from "react";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link to={to} onClick={() => setMenuOpen(false)} style={{
      color: isActive(to) ? "var(--gold)" : "rgba(255,255,255,0.75)",
      fontWeight: 500, fontSize: "0.9rem", letterSpacing: "0.3px",
      transition: "color 0.2s", textDecoration: "none",
    }}>{label}</Link>
  );

  return (
    <>
      <nav style={{
        background: "linear-gradient(135deg, var(--deep) 0%, var(--navy) 100%)",
        padding: "0 1.2rem", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 200,
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <span style={{ fontSize: "1.4rem" }}>⚓</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
            Harbor<span style={{ color: "var(--gold)" }}>List</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", "@media(max-width:640px)": { display: "none" } }} className="desktop-nav">
          {navLink("/listings", "Browse Boats")}
          {user ? (
            <>
              {navLink("/dashboard", "My Listings")}
              {navLink("/inbox", "Inbox")}
              <div style={{ position: "relative" }}>
                <button onClick={() => setDropOpen(o => !o)} style={{
                  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px", color: "white", padding: "6px 12px",
                  cursor: "pointer", fontSize: "0.85rem", fontWeight: 500,
                }}>
                  👤 {user.name.split(" ")[0]} ▾
                </button>
                {dropOpen && (
                  <div onClick={() => setDropOpen(false)} style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    background: "white", borderRadius: "10px",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                    minWidth: "160px", overflow: "hidden", border: "1px solid var(--border)",
                  }}>
                    {[{ label: "My Listings", to: "/dashboard" }, { label: "Inbox", to: "/inbox" }, { label: "List a Boat", to: "/listings/new" }].map(({ label, to }) => (
                      <Link key={to} to={to} style={{ display: "block", padding: "11px 16px", fontSize: "0.9rem", color: "var(--text)", borderBottom: "1px solid var(--border)", textDecoration: "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--foam)"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >{label}</Link>
                    ))}
                    <button onClick={() => { logout(); navigate("/"); setDropOpen(false); }} style={{ display: "block", width: "100%", padding: "11px 16px", fontSize: "0.9rem", color: "#c0392b", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {navLink("/login", "Sign In")}
              <Link to="/register" style={{ background: "var(--gold)", color: "var(--deep)", padding: "7px 16px", borderRadius: "7px", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
                List Your Boat
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(o => !o)} className="mobile-menu-btn" style={{
          background: "none", border: "none", color: "white", fontSize: "1.5rem",
          cursor: "pointer", padding: "4px", display: "none",
        }}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: "60px", left: 0, right: 0, bottom: 0,
          background: "var(--deep)", zIndex: 199, padding: "1.5rem",
          display: "flex", flexDirection: "column", gap: "1rem",
        }}>
          <Link to="/listings" onClick={() => setMenuOpen(false)} style={{ color: "white", fontSize: "1.1rem", textDecoration: "none", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Browse Boats</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ color: "white", fontSize: "1.1rem", textDecoration: "none", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>My Listings</Link>
              <Link to="/inbox" onClick={() => setMenuOpen(false)} style={{ color: "white", fontSize: "1.1rem", textDecoration: "none", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Inbox</Link>
              <Link to="/listings/new" onClick={() => setMenuOpen(false)} style={{ color: "var(--gold)", fontSize: "1.1rem", textDecoration: "none", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>+ List a Boat</Link>
              <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} style={{ background: "none", border: "none", color: "#e74c3c", fontSize: "1.1rem", textAlign: "left", cursor: "pointer", padding: "12px 0" }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{ color: "white", fontSize: "1.1rem", textDecoration: "none", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} style={{ background: "var(--gold)", color: "var(--deep)", padding: "14px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "1rem", textDecoration: "none", textAlign: "center", marginTop: "0.5rem" }}>
                List Your Boat Free
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
