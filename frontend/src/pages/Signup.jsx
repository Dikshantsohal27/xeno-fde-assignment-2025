// frontend/src/pages/Signup.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.error || "Signup failed");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ff6cab 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.3)",
          transition: "all 0.4s ease",
          transform: "scale(1)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow =
            "0 25px 50px rgba(0,0,0,0.35)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 10px 25px rgba(0,0,0,0.2)";
        }}
      >
        <h2
          style={{
            fontSize: "30px",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "25px",
            color: "#fff",
          }}
        >
          ✨ Create an Account
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "14px",
              fontSize: "16px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              background: "rgba(255,255,255,0.85)",
              transition: "0.3s",
            }}
            onFocus={(e) =>
              (e.target.style.boxShadow =
                "0 0 0 3px rgba(102,126,234,0.6)")
            }
            onBlur={(e) => (e.target.style.boxShadow = "none")}
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "14px",
              fontSize: "16px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              background: "rgba(255,255,255,0.85)",
              transition: "0.3s",
            }}
            onFocus={(e) =>
              (e.target.style.boxShadow =
                "0 0 0 3px rgba(118,75,162,0.6)")
            }
            onBlur={(e) => (e.target.style.boxShadow = "none")}
          />

          <button
            type="submit"
            style={{
              padding: "14px",
              fontSize: "16px",
              background:
                "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #ff6cab 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.4s",
              backgroundSize: "200% auto",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundPosition = "right center";
              e.target.style.transform = "scale(1.03)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundPosition = "left center";
              e.target.style.transform = "scale(1)";
            }}
          >
            Sign Up
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "10px",
              textAlign: "center",
              fontWeight: "500",
              backgroundColor: message.includes("successful")
                ? "rgba(212, 237, 218, 0.9)"
                : "rgba(248, 215, 218, 0.9)",
              color: message.includes("successful")
                ? "#155724"
                : "#721c24",
              border: message.includes("successful")
                ? "1px solid #c3e6cb"
                : "1px solid #f5c6cb",
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            marginTop: "25px",
            textAlign: "center",
            color: "#f1f1f1",
            fontSize: "15px",
          }}
        >
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{
              color: "#ffdeeb",
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
