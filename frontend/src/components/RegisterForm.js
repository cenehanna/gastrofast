import React, { useState } from 'react';

export default function RegisterForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://gastrofast.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Помилка під час реєстрації');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.card}>
        <h2 style={{ color: '#2ecc71', marginBottom: '15px' }}>🎉 Успішно!</h2>
        <p style={{ color: '#2c3e50', marginBottom: '20px' }}>
          Ви успішно створили акаунт у GastroFast.
        </p>
        <button
          onClick={onSwitchToLogin}
          style={{ ...styles.button, backgroundColor: '#2ecc71' }}
        >
          Перейти до входу
        </button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>📝 Створити акаунт</h2>
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Ваше Ім'я:</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Іван"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email:</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="ivan@mail.com"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Телефон:</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+380..."
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
            placeholder="Мінімум 6 символів"
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Створення...' : 'Зареєструватися'}
        </button>
      </form>

      <p style={styles.footerText}>
        Вже маєте акаунт?{' '}
        <span onClick={onSwitchToLogin} style={styles.link}>
          Увійти
        </span>
      </p>
    </div>
  );
}

// Використовуємо ті самі стилі, що й для форми логіну
const styles = {
  card: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '35px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '25px',
    fontSize: '1.6rem',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    textAlign: 'left',
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontWeight: '600', fontSize: '0.9rem', color: '#2c3e50' },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
    outline: 'none',
  },
  button: {
    backgroundColor: '#ff5722',
    color: '#fff',
    border: 'none',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    color: '#e74c3c',
    background: '#fdeae8',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '15px',
    border: '1px solid #fadbd8',
  },
  footerText: { marginTop: '20px', fontSize: '0.9rem', color: '#7f8c8d' },
  link: {
    color: '#ff5722',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};
