"use client";

const TransferResults = ({ message, files, skipped, downloadUrl }) => {
  return (
    <div style={{ marginTop: "2rem" }}>
      {message && <p><strong>{message}</strong></p>}

      {files.length > 0 && (
        <div>
          <h3>Copied Files</h3>
          <ul>
            {files.map((f) => (
              <li key={f}>{f}</li>
            ))}
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

      {downloadUrl && (
        <a
          href={downloadUrl}
          style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "0.6rem 1rem",
            background: "#0070f3",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
          }}
          download
        >
          Download ZIP
        </a>
      )}
    </div>
  );
};

export default TransferResults;
