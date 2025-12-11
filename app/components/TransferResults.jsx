"use client";

import { useAppContext } from "../context/AppContext";

export default function TransferResults({ message, files, skipped, selectedStore }) {
  const { token } = useAppContext();

  return (
    <div style={{ marginTop: "2rem" }}>
      {message && <p><strong>{message}</strong></p>}

      {files.length > 0 && (
        <div>
          <h3>Copied Files</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {files.map((file) => {
              if (!selectedStore || !token) return null;

              const url = `/api/auth/images/${selectedStore}/${file}?token=${token}`;

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
                    onError={(e) => {
                      e.target.style.opacity = 0.3;
                      e.target.title = "Not Found";
                    }}
                  />
                  <span>{file}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {skipped.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Skipped Orders (already printed)</h3>
          <ul>
            {skipped.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ ZIP DOWNLOAD BUTTON */}
      {selectedStore && token && (
  <a
    href={`/api/auth/download-zip?store=${selectedStore}&token=${token}`}
    style={{
      display: "inline-block",
      marginTop: "1.5rem",
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

    </div>
  );
}
