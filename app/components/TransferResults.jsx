"use client";

import { useAppContext } from "../context/AppContext";

export default function TransferResults({
  message,
  files,
  skipped,
  selectedStore,
  onClearHistory,
}) {
  const { token } = useAppContext();

  return (
    <div style={{ marginTop: "2rem" }}>
      {/* ===============================
          STATUS MESSAGE
         =============================== */}
      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      {/* ====================
          ZIP DOWNLOAD BUTTON 
         ===================== */}
      {selectedStore && token && files.length > 0 && (
        <a
          href={`/api/auth/download-zip?store=${encodeURIComponent(
            selectedStore
          )}&token=${encodeURIComponent(token)}&${files
            .map((f) => `file=${encodeURIComponent(f)}`)
            .join("&")}`}
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
          🧹 CLEAR HISTORY BUTTON
         =============================== */}
      {onClearHistory && (
        <div style={{ marginBottom: "1.5rem" }}>
          <button onClick={onClearHistory}>
            Clear History
          </button>
        </div>
      )}

      {/* ============
          THUMBNAILS
         ============= */}
      {files.length > 0 && (
        <div>
          <h3>Copied Files</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {files.map((file) => {
              if (!token || !selectedStore) return null;

              const url =
                `/api/auth/images/${selectedStore}/${file}` +
                `?token=${token}`;

              return (
                <li
                  key={file}
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <img
                    src={url}
                    alt={file}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "contain",
                      border: "1px solid #ccc",
                      padding: "4px",
                      background: "white",
                    }}
                  />
                  <span>{file}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ===============================
          SKIPPED FILES
         =============================== */}
      {skipped.length > 0 && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            border: "1px solid #f5c2c7",
            background: "#f8d7da",
            borderRadius: "6px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            ⚠️ Files Not Found
          </h3>
          <p>
            The following files could not be located and were skipped:
          </p>
          <ul>
            {skipped.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
