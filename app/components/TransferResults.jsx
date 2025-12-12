"use client";

import { useAppContext } from "../context/AppContext";

export default function TransferResults({
  message,
  files,
  skipped,
  selectedStore,
  onClearHistory,
  onRefresh,
}) {
  const { token } = useAppContext();

  const hasAnything =
    message || files.length > 0 || skipped.length > 0;

  if (!hasAnything && !selectedStore) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      {/* ===============================
          HEADER + ACTIONS
         =============================== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3>Transfer Results</h3>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          {onRefresh && (
            <button onClick={onRefresh}>
              Refresh
            </button>
          )}

          <button onClick={onClearHistory}>
            Clear History
          </button>
        </div>
      </div>

      {/* ===============================
          ✅ ZIP DOWNLOAD BUTTON (RESTORED)
         =============================== */}
      {selectedStore && token && (
        <a
          href={`/api/auth/download-zip?store=${selectedStore}&token=${token}`}
          style={{
            display: "inline-block",
            marginBottom: "1.5rem",
            padding: "0.6rem 1rem",
            background: "#0070f3",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Download ZIP
        </a>
      )}

      {/* ===============================
          RESULTS
         =============================== */}
      {message && <p>{message}</p>}

      {files.length > 0 && (
        <>
          <h4>Files</h4>
          <ul>
            {files.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}

      {skipped.length > 0 && (
        <>
          <h4>Skipped</h4>
          <ul>
            {skipped.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
