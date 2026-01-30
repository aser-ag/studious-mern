// client/src/pages/dashboard/Profile.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '', id: '' });
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const token = storedUser?.token;

  const api = axios.create({
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const res = await api.get('/api/users/profile');

      setUser({
        id: res.data._id,
        name: res.data.name,
        email: res.data.email
      });

      setFormData({
        name: res.data.name,
        password: ''
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load profile');

      if (err.response?.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = { name: formData.name };
      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const res = await api.put('/api/users/profile', payload);

      // Update local state
      setUser({
        id: res.data._id,
        name: res.data.name,
        email: res.data.email
      });

      // Update localStorage user
      const updatedStoredUser = {
        ...storedUser,
        name: res.data.name
      };
      localStorage.setItem('user', JSON.stringify(updatedStoredUser));

      setFormData(prev => ({ ...prev, password: '' }));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
          <div className="h-10 bg-gray-100 rounded"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

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

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow w-full max-w-md"
      >
        <div>
          <label className="block font-medium">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={saving}
            className="mt-1 p-2 border rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Email (read-only)</label>
          <input
            value={user.email}
            disabled
            className="mt-1 p-2 border rounded w-full bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium">
            New Password (optional)
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={saving}
            className="mt-1 p-2 border rounded w-full"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-primary-300 text-white rounded hover:bg-primary-400 disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      <div className="mt-8 bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Account Info</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Member ID</span>
            <span className="font-mono">{user.id}</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <button
            onClick={() => {
              if (window.confirm('Logout?')) {
                localStorage.removeItem('user');
                window.location.href = '/login';
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
