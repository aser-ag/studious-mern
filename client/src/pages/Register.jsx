// client/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('/api/auth/register', {
        name,
        email,
        password,
      });

      setSuccess('Account created successfully! Redirecting to login...');

      // Clear form
      setName('');
      setEmail('');
      setPassword('');

      // Redirect to login with success flag (used by Login.jsx)
      setTimeout(() => {
        navigate('/login?status=success');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create an Account
        </h2>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700">
              Name:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-success-300"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-success-300"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-success-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-success-500 text-white py-2 rounded hover:bg-success-600 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 text-sm">
          Already have an account?
          <Link
            to="/login"
            className="text-primary-300 hover:underline ml-1"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
