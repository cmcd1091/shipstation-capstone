"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

export default function TransfersAdmin() {
  const { token } = useAppContext();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransfers = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get("/api/auth/transfers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransfers(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    if (!token) return;

    const confirmClear = window.confirm(
      "Are you sure you want to clear ALL transfer history?"
    );
    if (!confirmClear) return;

    try {
      await axios.delete("/api/auth/transfers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransfers([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [token]);

  return (
    <div style={{ margin: "2rem auto", maxWidth: "700px", textAlign: "center" }}>
      <h2>Transfer History</h2>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={fetchTransfers} disabled={loading}>
          Refresh
        </button>

        <button
          onClick={clearHistory}
          style={{
            marginLeft: "1rem",
            background: "#c0392b",
            color: "white",
            padding: "0.4rem 0.8rem",
            borderRadius: "4px",
            border: "none",
          }}
        >
          Clear History
        </button>
      </div>

      {transfers.length === 0 ? (
        <p>No transfer history found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {transfers.map((t) => (
            <li
              key={t._id}
              style={{
                padding: "0.5rem",
                borderBottom: "1px solid #ccc",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Order: {t.orderNumber}</span>
              <span>SKU: {t.sku}</span>
              <span>{t.skipped ? "⛔ Skipped" : "📦 Copied"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
