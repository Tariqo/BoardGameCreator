import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login, user, role } = useAuth();
  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(role === 'admin' ? '/admin' : '/profile');
    }
  }, [user, role, navigate]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const name = email.split('@')[0];
    const role = email.includes('admin') ? 'admin' : 'user';

    login('fake_token', role, name);
    navigate(role === 'admin' ? '/admin' : '/profile');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-80 space-y-4">
        <h1 className="text-lg font-semibold">Login</h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          required
        />

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
