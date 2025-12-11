"use client";

import CopiedItem from "./CopiedItem";

const CopiedContainer = ({ files, selectedStore }) => {
  if (!files || files.length === 0) return null;

  return (
    <ul
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        listStyle: "none",
        padding: 0,
      }}
    >
      {files.map((file, idx) => (
        <CopiedItem key={idx} file={file} selectedStore={selectedStore} />
      ))}
    </ul>
  );
};

export default CopiedContainer;
