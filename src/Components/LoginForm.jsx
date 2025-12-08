import { useState } from "react";
import axios from "axios";

const LoginForm = ({ onLogin, token, userEmail }) => {
  const [email, setEmail] = useState(userEmail || "admin@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });
      onLogin(res.data.token, res.data.email);
      setPassword("");
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Login failed"
      );
    }
  };

  if (token) {
    return (
      <div style={{ marginTop: "1rem" }}>
        <p>
          Logged in as <strong>{userEmail}</strong>
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Email:{" "}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: "0.25rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Password:{" "}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: "0.25rem" }}
            />
          </label>
        </div>
        <button type="submit">Log In</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LoginForm;
