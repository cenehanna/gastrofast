import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";

export default function LoginForm({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Неправильний email або пароль");
      }

      // Викликаємо функцію з контексту і передаємо токен та дані користувача
      login(data.user, data.access_token);

      // Перенаправляємо в каталог або оновлюємо стан сторінки
      window.location.href = "/catalog";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>🍕 Вхід у GastroFast</h2>
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email:</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="yourmail@example.com"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Пароль:</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Вхід..." : "Увійти"}
        </button>
      </form>

      <p style={styles.footerText}>
        Немає акаунту?{" "}
        <span onClick={onSwitchToRegister} style={styles.link}>
          Зареєструватися
        </span>
      </p>
    </div>
  );
}

// Прості inline-стилі для збереження архітектури проєкту
const styles = {
  card: {
    maxWidth: "400px",
    margin: "60px auto",
    padding: "35px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "25px",
    fontSize: "1.6rem",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    textAlign: "left",
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontWeight: "600", fontSize: "0.9rem", color: "#2c3e50" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "0.95rem",
    outline: "none",
  },
  button: {
    backgroundColor: "#ff5722",
    color: "#fff",
    border: "none",
    padding: "12px",
    fontSize: "1rem",
    fontWeight: "bold",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s",
    marginTop: "10px",
  },
  error: {
    color: "#e74c3c",
    background: "#fdeae8",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "0.85rem",
    marginBottom: "15px",
    border: "1px solid #fadbd8",
  },
  footerText: { marginTop: "20px", fontSize: "0.9rem", color: "#7f8c8d" },
  link: {
    color: "#ff5722",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
