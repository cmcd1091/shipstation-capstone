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
              if (!selectedStore || !token) {
                console.log("⛔ Missing selectedStore or token:", { selectedStore, token });
                return null;
              }

              // THIS IS THE CORRECT URL
              const url = `/api/auth/images/${selectedStore}/${file}?token=${token}`;

              console.log("🔗 Thumbnail URL:", url);

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
    </div>
  );
}
