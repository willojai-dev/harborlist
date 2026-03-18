import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import BoatCard from "../components/BoatCard";
import MapView from "../components/MapView";

const TYPES = ["", "Sailboat", "Motorboat", "Yacht", "Pontoon", "Catamaran", "Other"];
const CONDITIONS = ["", "Like New", "Excellent", "Good", "Fair", "Project"];
const SORTS = [
  { value: "created_at_desc", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "length_asc", label: "Length: Short to Long" },
  { value: "year_desc", label: "Year: Newest" },
];

const inputSt = {
  width: "100%", padding: "9px 12px", border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: "7px", fontSize: "0.85rem", color: "var(--text)", background: "white", outline: "none",
};

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    type: "", condition: "", min_price: "", max_price: "",
    min_length: "", max_length: "", sort: "created_at_desc",
  });

  // Sync URL search param when navigating from homepage
  useEffect(() => {
    const s = searchParams.get("search") || "";
    setFilters(f => ({ ...f, search: s }));
  }, [searchParams.get("search")]);

  useEffect(() => {
    setLoading(true);
    api.listings.list(Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")))
      .then(d => { setListings(d.listings); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const clear = () => setFilters({ search: "", type: "", condition: "", min_price: "", max_price: "", min_length: "", max_length: "", sort: "created_at_desc" });

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--navy)", marginBottom: "0.2rem" }}>Browse Boats</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{loading ? "Loading…" : `${total} listing${total !== 1 ? "s" : ""} found`}</p>
      </div>

      <div className="listings-layout" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Filters */}
        <div className="listings-filters" style={{ background: "white", borderRadius: "var(--radius)", padding: "1.5rem", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", position: "sticky", top: "80px" }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--navy)", marginBottom: "1.2rem" }}>🔍 Filters</h3>

          {[
            ["Search", <input key="s" style={inputSt} placeholder="Name, location…" value={filters.search} onChange={e => set("search", e.target.value)} />],
            ["Boat Type", <select key="t" style={inputSt} value={filters.type} onChange={e => set("type", e.target.value)}>{TYPES.map(t => <option key={t} value={t}>{t || "All Types"}</option>)}</select>],
            ["Condition", <select key="c" style={inputSt} value={filters.condition} onChange={e => set("condition", e.target.value)}>{CONDITIONS.map(c => <option key={c} value={c}>{c || "Any Condition"}</option>)}</select>],
            ["Sort By", <select key="so" style={inputSt} value={filters.sort} onChange={e => set("sort", e.target.value)}>{SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select>],
          ].map(([label, el]) => (
            <div key={label} style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>{label}</label>
              {el}
            </div>
          ))}

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Price ($)</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input style={{ ...inputSt, width: "50%" }} placeholder="Min" type="number" value={filters.min_price} onChange={e => set("min_price", e.target.value)} />
              <input style={{ ...inputSt, width: "50%" }} placeholder="Max" type="number" value={filters.max_price} onChange={e => set("max_price", e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Length (ft)</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input style={{ ...inputSt, width: "50%" }} placeholder="Min" type="number" value={filters.min_length} onChange={e => set("min_length", e.target.value)} />
              <input style={{ ...inputSt, width: "50%" }} placeholder="Max" type="number" value={filters.max_length} onChange={e => set("max_length", e.target.value)} />
            </div>
          </div>

          <button onClick={clear} style={{ width: "100%", padding: "9px", background: "var(--foam)", border: "1px solid rgba(26,107,138,0.2)", borderRadius: "7px", color: "var(--ocean)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
            Clear Filters
          </button>
        </div>

        {/* Results */}
        <div>
          <MapView boats={listings} />
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem", animation: "float 1.5s ease-in-out infinite" }}>⚓</div>
              <p>Loading listings…</p>
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚓</div>
              <p style={{ fontSize: "1.1rem" }}>No boats match your filters.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "1.4rem" }}>
              {listings.map(boat => <BoatCard key={boat.id} boat={boat} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
