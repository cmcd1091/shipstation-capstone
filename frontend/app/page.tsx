"use client";

import { AppProvider, useAppContext } from "./context/AppContext";
import App from "./components/App";
import LoginForm from "./components/LoginForm";

export default function Page() {
  return (
    <AppProvider>
      <PageContent />
    </AppProvider>
  );
}

function PageContent() {
  const { token } = useAppContext();

  return token ? <App /> : <LoginForm />;
}
