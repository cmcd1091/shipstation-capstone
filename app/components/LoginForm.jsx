"use client";

import { useState } from "react";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

const LoginForm = () => {
  const { token, setToken, userEmail, setUserEmail } = useAppContext();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email: userEmail,
        password,
      });

      setToken(res.data.token);
      setUserEmail(res.data.email);
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
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
    <div style={{ marginBottom: "2rem" }}>
      <h2>Admin Login</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.8rem" }}>
          <label style={{ fontWeight: "bold" }}>
            Email:
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              style={{
                padding: "0.3rem",
                marginLeft: "0.5rem",
                border: "1px solid #ccc",
                width: "220px",
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "0.8rem" }}>
          <label style={{ fontWeight: "bold" }}>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: "0.3rem",
                marginLeft: "0.5rem",
                border: "1px solid #ccc",
                width: "220px",
              }}
            />
          </label>
        </div>

        <button type="submit" style={{ marginTop: "0.5rem" }}>
          Log In
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LoginForm;
