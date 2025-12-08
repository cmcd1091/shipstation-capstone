import { useEffect, useState } from "react";

const TransfersAdmin = ({ token }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [skippedFilter, setSkippedFilter] = useState("all");

  const fetchTransfers = async () => {
    if (!token) {
      setError("Please log in to view transfers.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (storeFilter) params.append("store", storeFilter);
      if (skippedFilter === "skipped") params.append("skipped", "true");
      if (skippedFilter === "not-skipped") params.append("skipped", "false");

      const res = await fetch(
        `http://localhost:3001/api/transfers?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }

      const data = await res.json();
      setTransfers(data);
    } catch (err) {
      setError(err.message || "Error fetching transfers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransfers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeFilter, skippedFilter, token]);

  const handleDelete = async (id) => {
    if (!token) {
      alert("Please log in first.");
      return;
    }

    if (!window.confirm("Delete this transfer record?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/transfers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }

      setTransfers((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message || "Error deleting transfer");
    }
  };

  if (!token) {
    return (
      <div style={{ marginTop: "2rem" }}>
        <h2>Transfer History (MongoDB)</h2>
        <p>Please log in to view transfer history.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Transfer History (MongoDB)</h2>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <label>
          Store filter:{" "}
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="coed">Coed Naked</option>
            <option value="duke">Duke Gomez</option>
            {/* add others as needed */}
          </select>
        </label>

        <label>
          Skipped:
          <select
            value={skippedFilter}
            onChange={(e) => setSkippedFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="skipped">Skipped only</option>
            <option value="not-skipped">Non-skipped only</option>
          </select>
        </label>

        <button onClick={fetchTransfers} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading transfers...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && transfers.length === 0 && <p>No transfers found.</p>}

      {transfers.length > 0 && (
        <table
          style={{
            margin: "0 auto",
            borderCollapse: "collapse",
            minWidth: "80%",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Store
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Order #
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                SKU
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Base SKU
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Copy #
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                File
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Skipped
              </th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t._id}>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {t.store}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {t.orderNumber}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {t.sku}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {t.baseSku}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {t.quantityIndex}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {t.fileName}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {t.skipped ? "Yes" : "No"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  <button onClick={() => handleDelete(t._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransfersAdmin;
