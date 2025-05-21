import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;

    if (!email || !password) {
      alert('Email and password required');
      return;
    }

    const name = email.split('@')[0];
    const role = email.includes('admin') ? 'admin' : 'user';

    login('fake_token', role, name);
    navigate('/games');
  };

  const handleGuestLogin = () => {
    login('guest_token', 'user', 'Guest');
    navigate('/games');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-full max-w-sm space-y-4"
      >
        <h1 className="text-lg font-semibold text-gray-800">Login</h1>

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

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700 transition"
        >
          Login
        </button>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded w-full hover:bg-gray-300 transition"
        >
          Continue as Guest
        </button>

        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-green-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
