import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  return (
    <AppContext.Provider
      value={{
        token,
        setToken,
        userEmail,
        setUserEmail
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for convenience
export const useAppContext = () => useContext(AppContext);
