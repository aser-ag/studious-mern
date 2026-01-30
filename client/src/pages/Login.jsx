// client/src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Handle messages from redirects (e.g. after register)
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get('status') === 'success') {
      setSuccess('Registration successful! Please login.');
    }

    if (params.get('error')) {
      setError(params.get('error'));
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', {
        email,
        password,
      });

      /**
       * res.data shape (from backend):
       * {
       *   _id,
       *   name,
       *   email,
       *   token
       * }
       */

      // Persist auth data
      localStorage.setItem('user', JSON.stringify(res.data));
      localStorage.setItem('token', res.data.token);

      // Set axios default auth header for future requests
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${res.data.token}`;

      // Redirect after login
      navigate('/app/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Log in to Your Account
        </h2>

        {success && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
              className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-primary-300"
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
              className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-300 text-white py-2 rounded hover:bg-primary-400 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 text-sm">
          Don't have an account?
          <Link
            to="/register"
            className="text-primary-300 hover:underline ml-1"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
