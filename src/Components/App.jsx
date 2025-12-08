import { useState } from "react";
import FetchParams from "./FetchParams";
import CopiedContainer from "./CopiedContainer";
import TransfersAdmin from "./TransfersAdmin";
import LoginForm from "./LoginForm";
import "../Styling/App.css";

const App = () => {
  const [pageSize, setPageSize] = useState(5);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [skipped, setSkipped] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (newToken, email) => {
    setToken(newToken);
    setUserEmail(email);
  };

  return (
    <>
      <div
        style={{
          margin: "0 auto",
          padding: "1rem",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <h1>Shipstation Transfers</h1>

        <FetchParams
          pageSize={pageSize}
          setPageSize={setPageSize}
          setFiles={setFiles}
          setMessage={setMessage}
          setSkipped={setSkipped}
          setSelectedStore={setSelectedStore}
        />

        {message && <p>{message}</p>}

        {skipped.length > 0 && (
          <div>
            <p>Skipped orders:</p>
            <ul style={{ listStyle: "none" }}>
              {skipped.map((order, idx) => (
                <li key={idx}>{order}</li>
              ))}
            </ul>
          </div>
        )}

        <CopiedContainer files={files} selectedStore={selectedStore} />

        {/* Auth + Admin */}
        <LoginForm onLogin={handleLogin} token={token} userEmail={userEmail} />

        <TransfersAdmin token={token} />
      </div>
    </>
  );
};

export default App;
