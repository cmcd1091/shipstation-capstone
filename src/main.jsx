import React from "react";
import ReactDOM from "react-dom/client";
import App from "../app/components/App.js";
import { AppProvider } from "../app/context/AppContext.js";
import "../app/styles/App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
