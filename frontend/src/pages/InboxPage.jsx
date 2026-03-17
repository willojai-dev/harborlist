import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../components/AuthContext";

export default function InboxPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.messages.inbox()
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const markRead = async (id) => {
    await api.messages.markRead(id);
    setMessages(ms => ms.map(m => m.id === id ? { ...m, read: 1 } : m));
  };

  const toggle = (id) => {
    setExpanded(e => e === id ? null : id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.read) markRead(id);
  };

  const unread = messages.filter(m => !m.read).length;

  if (loading) return <div style={{ textAlign: "center", padding: "6rem", color: "var(--muted)" }}><div style={{ fontSize: "2.5rem", animation: "float 1.5s ease-in-out infinite" }}>⚓</div></div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--navy)", marginBottom: "0.3rem" }}>
          Inbox {unread > 0 && <span style={{ fontSize: "1rem", background: "var(--ocean)", color: "white", borderRadius: "20px", padding: "2px 10px", marginLeft: "8px", verticalAlign: "middle" }}>{unread}</span>}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{messages.length} message{messages.length !== 1 ? "s" : ""} about your listings</p>
      </div>

      {messages.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem", background: "white", borderRadius: "var(--radius)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✉️</div>
          <h2 style={{ color: "var(--navy)", marginBottom: "0.5rem" }}>No messages yet</h2>
          <p style={{ color: "var(--muted)" }}>When buyers message you about your listings, they'll appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              background: "white", borderRadius: "var(--radius)",
              boxShadow: "var(--shadow-sm)", border: `1px solid ${!msg.read ? "var(--ocean)" : "var(--border)"}`,
              overflow: "hidden",
            }}>
              <div onClick={() => toggle(msg.id)} style={{ padding: "1rem 1.2rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                {!msg.read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ocean)", flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem" }}>
                    <span style={{ fontWeight: msg.read ? 400 : 700, color: "var(--navy)", fontSize: "0.95rem" }}>{msg.sender_name}</span>
                    <span style={{ color: "var(--muted)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                    Re: <Link to={`/listings/${msg.listing_id}`} onClick={e => e.stopPropagation()} style={{ color: "var(--ocean)", fontWeight: 500 }}>{msg.listing_name}</Link>
                  </div>
                  {expanded !== msg.id && (
                    <div style={{ color: "#4a5568", fontSize: "0.85rem", marginTop: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {msg.body}
                    </div>
                  )}
                </div>
                <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{expanded === msg.id ? "▲" : "▼"}</span>
              </div>
              {expanded === msg.id && (
                <div style={{ padding: "1rem 1.2rem 1.2rem", borderTop: "1px solid var(--border)", background: "var(--foam)" }}>
                  <p style={{ color: "#2d3748", lineHeight: 1.7, fontSize: "0.92rem", marginBottom: "1rem" }}>{msg.body}</p>
                  <a href={`mailto:${msg.sender_email}`} style={{
                    display: "inline-block", padding: "8px 18px", background: "var(--ocean)", color: "white",
                    borderRadius: "7px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                  }}>
                    ✉️ Reply to {msg.sender_email}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
