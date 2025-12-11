"use client";

import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import FetchParams from "./FetchParams";
import CopiedContainer from "./CopiedContainer";
import TransfersAdmin from "./TransfersAdmin";

const App = () => {
  const { token } = useAppContext();

  // All required state hooks
  const [pageSize, setPageSize] = useState(10);
  const [selectedStore, setSelectedStore] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [skipped, setSkipped] = useState([]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>ShipStation Transfer Utility</h1>

      {!token && <p style={{ color: "red" }}>Please log in to access admin features.</p>}

      <FetchParams
        pageSize={pageSize}
        setPageSize={setPageSize}
        setSelectedStore={setSelectedStore}
        setMessage={setMessage}
        setFiles={setFiles}
        setSkipped={setSkipped}
      />

      <CopiedContainer files={files} selectedStore={selectedStore} />

      {token && (
        <>
          <h2>Admin</h2>
          <TransfersAdmin />
        </>
      )}
    </div>
  );
};

export default App;
