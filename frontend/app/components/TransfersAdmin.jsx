"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const TransfersAdmin = () => {
  const { token } = useAppContext();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransfers = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/transfers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransfers(res.data);
    } catch (err) {
      console.error("Error fetching transfers:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransfers();
  }, [token]);

  return (
    <div style={{ margin: "1rem auto", maxWidth: "600px", textAlign: "center" }}>
      <h2>Transfer History</h2>
      <button onClick={fetchTransfers} disabled={loading}>
        {loading ? "Loading..." : "Refresh"}
      </button>
      {transfers.length === 0 ? (
        <p>No transfer history found.</p>
      ) : (
        <ul style={{ padding: 0, listStyle: "none" }}>
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
              <span>{t.skipped ? "⛔️ Skipped" : "📦 Copied"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransfersAdmin;
