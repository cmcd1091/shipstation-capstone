"use client";

import { useState } from "react";
import axios from "axios";

const FetchParams = ({
  pageSize,
  setPageSize,
  setSelectedStore,
  setMessage,
  setFiles,
  setSkipped,
  setDownloadUrl,
}) => {
  const [store, setStore] = useState("coed");
  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchTransfers = async () => {
    setFiles([]);
    setSkipped([]);
    setMessage("");

    try {
      const res = await axios.get(
        `${API}/fetch-transfers?store=${store}&pageSize=${pageSize}`
      );

      setSelectedStore(store);
      setMessage(res.data.message);
      setFiles(res.data.files);
      setSkipped(res.data.skippedOrders);
      setDownloadUrl(res.data.downloadUrl);
    } catch (err) {
      setMessage("Error fetching transfers");
    }
  };

  return (
    <div>
      <label>
        Store:
        <select
          value={store}
          onChange={(e) => setStore(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        >
          <option value="coed">Coed Naked</option>
          <option value="duke">Duke Gomez</option>
        </select>
      </label>

      <div style={{ marginTop: "0.5rem" }}>
        <label>
          Orders to fetch:
          <input
            type="number"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <button onClick={fetchTransfers} style={{ marginTop: "0.75rem" }}>
        Fetch Transfers
      </button>
    </div>
  );
};

export default FetchParams;
