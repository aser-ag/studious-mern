// client/src/pages/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    courseCount: 0,
    tasksCount: 0,
    eventsCount: 0,
    userName: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get logged-in user
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!user || !token) {
          navigate('/login');
          return;
        }

        // Ensure auth header is set
        axios.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${token}`;

        // Fetch real data
        const [coursesRes, tasksRes, eventsRes] = await Promise.all([
          axios.get('/api/courses'),
          axios.get('/api/tasks'),
          axios.get('/api/events'),
        ]);

        setStats({
          courseCount: coursesRes.data.length,
          tasksCount: tasksRes.data.length,
          eventsCount: eventsRes.data.length,
          userName: user.name || '',
        });
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data');

        if (err.response?.status === 401) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 bg-gray-100 rounded h-48"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {stats.userName}!
      </h1>

      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* Courses Card */}
        <Link
          to="/app/courses"
          className="p-6 rounded shadow-md bg-gradient-to-br from-secondary-25 to-secondary-50 hover:from-secondary-50 hover:to-secondary-75 transition-all duration-300 transform hover:-translate-y-1 hover:border hover:border-secondary-400 text-center"
        >
          <img
            src="/assets/icons/dashboard_course.svg"
            alt="Courses"
            className="w-20 h-20 mx-auto mb-3 opacity-90"
          />
          <h2 className="text-xl font-bold text-text-400">
            {stats.courseCount} Courses
          </h2>
          <p className="text-sm text-text-400 mt-1">
            Organize your classes
          </p>
        </Link>

        {/* Tasks Card */}
        <Link
          to="/app/tasks"
          className="p-6 rounded shadow-md bg-gradient-to-br from-secondary-25 to-secondary-50 hover:from-secondary-50 hover:to-secondary-75 transition-all duration-300 transform hover:-translate-y-1 hover:border hover:border-secondary-400 text-center"
        >
          <img
            src="/assets/icons/dashboard_task.svg"
            alt="Tasks"
            className="w-20 h-20 mx-auto mb-3 opacity-90"
          />
          <h2 className="text-xl font-bold text-text-400">
            {stats.tasksCount} Tasks
          </h2>
          <p className="text-sm text-text-400 mt-1">
            Track your work
          </p>
        </Link>

        {/* Events Card */}
        <Link
          to="/app/events"
          className="p-6 rounded shadow-md bg-gradient-to-br from-secondary-25 to-secondary-50 hover:from-secondary-50 hover:to-secondary-75 transition-all duration-300 transform hover:-translate-y-1 hover:border hover:border-secondary-400 text-center"
        >
          <img
            src="/assets/icons/dashboard_event.svg"
            alt="Events"
            className="w-20 h-20 mx-auto mb-3 opacity-90"
          />
          <h2 className="text-xl font-bold text-text-400">
            {stats.eventsCount} Events
          </h2>
          <p className="text-sm text-text-400 mt-1">
            Stay on schedule
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
