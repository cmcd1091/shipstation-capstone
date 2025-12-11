"use client";

const TransferResults = ({ message, files, skipped, selectedStore }) => {
  return (
    <div style={{ marginTop: "2rem" }}>
      {message && <p><strong>{message}</strong></p>}

      {files.length > 0 && (
        <div>
          <h3>Copied Files</h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginTop: "1rem"
          }}>
            {files.map((f) => (
              <div key={f} style={{ textAlign: "center" }}>
                
                {/* THIS IS THE FIX — use your API route */}
                <img
                  src={`/api/auth/images/${selectedStore}/${f}`}
                  alt={f}
                  style={{ width: "180px", border: "1px solid #ccc" }}
                />

                <p>{f}</p>
              </div>
            ))}
          </div>
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
};

export default TransferResults;
