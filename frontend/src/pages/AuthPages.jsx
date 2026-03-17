import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.name) { setError("Name is required"); setLoading(false); return; }
        await register(form.name, form.email, form.password, form.phone);
      }
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputSt = {
    width: "100%", padding: "11px 14px", border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: "8px", fontSize: "0.95rem", outline: "none", marginBottom: "12px", display: "block",
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--bg)" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "2.5rem", width: "100%", maxWidth: "420px", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⚓</div>
          <h1 style={{ fontSize: "1.6rem", color: "var(--navy)" }}>{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "4px" }}>
            {isLogin ? "Sign in to manage your listings" : "Start listing your boat today"}
          </p>
        </div>

        {!isLogin && <input style={inputSt} placeholder="Your name" value={form.name} onChange={set("name")} />}
        <input style={inputSt} type="email" placeholder="Email address" value={form.email} onChange={set("email")} />
        <input style={inputSt} type="password" placeholder="Password" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && submit()} />
        {!isLogin && <input style={inputSt} placeholder="Phone (optional)" value={form.phone} onChange={set("phone")} />}

        {error && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginBottom: "10px", background: "#fdecea", padding: "8px 12px", borderRadius: "6px" }}>{error}</p>}

        <button onClick={submit} disabled={loading} style={{
          width: "100%", padding: "13px", background: "var(--ocean)", border: "none", borderRadius: "8px",
          color: "white", fontWeight: 600, fontSize: "1rem", cursor: "pointer", marginBottom: "1rem",
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
        </button>

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.9rem" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link to={isLogin ? "/register" : "/login"} style={{ color: "var(--ocean)", fontWeight: 600 }}>
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}

export function LoginPage() { return <AuthForm mode="login" />; }
export function RegisterPage() { return <AuthForm mode="register" />; }
