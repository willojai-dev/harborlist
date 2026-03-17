import { useEffect, useRef } from "react";

export default function ListingMap({ lat, lng, location }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng || !mapRef.current) return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = async () => {
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

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 11,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Custom marina-style marker
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background: var(--ocean, #1a6b8a);
          color: white;
          border: 3px solid white;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.35);
        ">⚓</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -26],
      });

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: 'DM Sans', sans-serif; padding: 4px;">
            <div style="font-weight: 700; color: #0d1f3c; font-size: 0.9rem;">📍 ${location}</div>
            <div style="color: #6b7f95; font-size: 0.78rem; margin-top: 3px;">Approximate location</div>
          </div>
        `, { maxWidth: 200 })
        .openPopup();

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng]);

  if (!lat || !lng) {
    return (
      <div style={{
        background: "var(--foam)", borderRadius: "var(--radius)",
        padding: "2rem", textAlign: "center", color: "var(--muted)",
        border: "1px solid var(--border)", fontSize: "0.9rem",
      }}>
        📍 {location}
        <div style={{ fontSize: "0.78rem", marginTop: "4px" }}>No coordinates available</div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
      <div style={{ background: "var(--navy)", padding: "10px 14px", fontSize: "0.85rem", color: "white", fontWeight: 600 }}>
        📍 {location}
      </div>
      <div ref={mapRef} style={{ height: "240px", width: "100%" }} />
    </div>
  );
}
