"use client";

import { useState } from "react";
import FetchParams from "./FetchParams";
import TransferResults from "./TransferResults";

export default function App() {
  const [selectedStore, setSelectedStore] = useState("");
  const [files, setFiles] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [message, setMessage] = useState("");
  const [pageSize, setPageSize] = useState(10);

  return (
    <div>
      <FetchParams
        pageSize={pageSize}
        setPageSize={setPageSize}
        setSelectedStore={setSelectedStore}
        setMessage={setMessage}
        setFiles={setFiles}
        setSkipped={setSkipped}
      />

      <TransferResults
        message={message}
        files={files}
        skipped={skipped}
        selectedStore={selectedStore}   /* ← IMPORTANT */
      />
    </div>
  );
}
