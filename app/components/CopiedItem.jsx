"use client";

import { useMemo } from "react";

const CopiedItem = ({ file, selectedStore }) => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

  const { skuPart, orderPart } = useMemo(() => {
    const fileWithoutExt = file.replace(".png", "");
    const splitIndex = fileWithoutExt.lastIndexOf("-CN-");

    return {
      skuPart: fileWithoutExt.slice(0, splitIndex),
      orderPart: fileWithoutExt.slice(splitIndex + 1),
    };
  }, [file]);

  return (
    <li style={{ margin: "1rem" }}>
      <img
        src={`${API_BASE}/images/${selectedStore}/${file}`}
        alt={file}
        style={{
          width: "100px",
          border: "1px solid #ccc",
        }}
      />
      <div>Order: {orderPart}</div>
    </li>
  );
};

export default CopiedItem;
