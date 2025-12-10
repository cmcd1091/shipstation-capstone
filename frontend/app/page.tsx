"use client";

import App from "./components/App";
import { AppProvider } from "./context/AppContext";

export default function Page() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
