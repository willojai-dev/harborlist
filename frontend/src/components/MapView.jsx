import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function MapView({ boats, showToggle = true }) {
  const [show, setShow] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const navigate = useNavigate();

  const validBoats = boats.filter(b => b.lat && b.lng);

  // Load Leaflet CSS once
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!show || !mapRef.current) return;

    const initMap = async () => {
      // Dynamically load Leaflet
      if (!window.L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const L = window.L;

      // Destroy existing map if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Create map centered on continental US
      const map = L.map(mapRef.current, {
        center: [37.5, -96],
        zoom: 4,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      validBoats.forEach(boat => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            background: var(--ocean, #1a6b8a);
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          ">${boat.type === "Sailboat" ? "⛵" : "🚤"}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -20],
        });

        const marker = L.marker([boat.lat, boat.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: 'DM Sans', sans-serif; min-width: 160px;">
              <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 4px; color: #0d1f3c;">${boat.name}</div>
              <div style="color: #6b7f95; font-size: 0.8rem; margin-bottom: 4px;">${boat.type} · ${boat.length}ft · ${boat.year}</div>
              <div style="color: #1a6b8a; font-weight: 700; font-size: 0.95rem; margin-bottom: 8px;">$${Number(boat.price).toLocaleString()}</div>
              <div style="color: #6b7f95; font-size: 0.78rem; margin-bottom: 8px;">📍 ${boat.location}</div>
              <a href="/listings/${boat.id}" style="
                display: block; text-align: center;
                background: #1a6b8a; color: white;
                padding: 6px 12px; border-radius: 6px;
                font-size: 0.8rem; font-weight: 600;
                text-decoration: none;
              ">View Listing →</a>
            </div>
          `, { maxWidth: 220 });

        markersRef.current.push(marker);
      });

      // Fit bounds to markers if we have any
      if (validBoats.length > 0) {
        const bounds = L.latLngBounds(validBoats.map(b => [b.lat, b.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [show, JSON.stringify(validBoats.map(b => b.id))]);

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {showToggle && (
        <button onClick={() => setShow(s => !s)} style={{
          background: show ? "var(--navy)" : "white",
          color: show ? "white" : "var(--navy)",
          border: "1px solid var(--navy)",
          padding: "7px 16px", borderRadius: "7px",
          fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
          marginBottom: "0.8rem",
        }}>
          {show ? "🗺️ Hide Map" : "🗺️ Show Map"}
        </button>
      )}

      {show && (
        <div style={{ background: "white", borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
          <div style={{ background: "var(--navy)", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>🗺️ Listing Locations</span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginLeft: "auto" }}>{validBoats.length} boats</span>
          </div>
          <div ref={mapRef} style={{ height: "380px", width: "100%" }} />
        </div>
      )}
    </div>
  );
}
