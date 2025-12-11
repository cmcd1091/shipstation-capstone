"use client";

import axios from "axios";
import { useState } from "react";

const FetchParams = ({
  pageSize,
  setPageSize,
  setSelectedStore,
  setMessage,
  setFiles,
  setSkipped,
}) => {
  const [localStore, setLocalStore] = useState("coed");

  const fetchTransfers = async (store) => {
    if (!store) {
      setMessage("Please select a store before fetching.");
      return;
    }

    setFiles([]);
    setSkipped([]);
    setSelectedStore(store);

    try {
      const res = await axios.get("/api/auth/fetch-transfers", {
        params: { store, pageSize },
      });

      setMessage(res.data.message);
      setFiles(res.data.files);
      setSkipped(res.data.skippedOrders);
    } catch (error) {
      setMessage("Error: " + (error.response?.data || error.message));
    }
  };

  return (
    <div>
      <label>
        Store:
        <select
          value={localStore}
          onChange={(e) => setLocalStore(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        >
          <option value="coed">Coed Naked</option>
          <option value="duke">Duke Gomez</option>
        </select>
      </label>

      <div style={{ marginTop: "0.5rem" }}>
        <label>
          Number of orders:
          <input
            type="number"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{
              padding: "0.3rem",
              marginLeft: "0.5rem",
            }}
          />
        </label>
      </div>

      <button
        onClick={() => fetchTransfers(localStore)}
        style={{ marginTop: "0.75rem" }}
      >
        Fetch & Copy
      </button>
    </div>
  );
};

export default FetchParams;
