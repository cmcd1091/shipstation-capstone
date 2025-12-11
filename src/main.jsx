import React from "react";
import ReactDOM from "react-dom/client";
import App from "../frontend/app/components/App";
import { AppProvider } from "../frontend/app/context/AppContext.jsx";
import "../frontend/app/styles/App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
