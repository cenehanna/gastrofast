import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
      }}
    >
      {isLoginView ? (
        <LoginForm onSwitchToRegister={() => setIsLoginView(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLoginView(true)} />
      )}
    </div>
  );
}
