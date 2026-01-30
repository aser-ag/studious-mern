// client/src/pages/dashboard/Course.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Course = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusCounts, setStatusCounts] = useState({ todo: 0, in_progress: 0, done: 0 });

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));

      if (!user?.token) {
        navigate('/login');
        return;
      }

      axios.defaults.headers.common.Authorization = `Bearer ${user.token}`;

      const courseRes = await axios.get(`/api/courses/${id}`);
      setCourse(courseRes.data);

      const tasksRes = await axios.get(`/api/tasks?course_id=${id}`);
      setTasks(tasksRes.data);

      const counts = { todo: 0, in_progress: 0, done: 0 };
      tasksRes.data.forEach(t => counts[t.status]++);
      setStatusCounts(counts);

      const eventsRes = await axios.get(`/api/events?course_id=${id}`);
      setEvents(eventsRes.data);
    } catch (err) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async () => {
    if (!confirm('Delete this course?')) return;
    await axios.delete(`/api/courses/${id}`);
    navigate('/app/courses');
  };

  if (loading) return <div className="p-6 animate-pulse h-40 bg-gray-100 rounded" />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => navigate('/app/courses')}>← Back</button>

      <div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-gray-600 mt-2">{course.description}</p>
        <button onClick={deleteCourse} className="text-red-600 mt-2">Delete Course</button>
      </div>

      <div className="flex gap-6">
        <span>To-Do: {statusCounts.todo}</span>
        <span>In Progress: {statusCounts.in_progress}</span>
        <span>Done: {statusCounts.done}</span>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500">No tasks yet.</p>
          ) : (
            tasks.map(task => (
              <div key={task._id} className="p-3 border rounded mb-3">
                <h3 className="font-semibold">{task.title}</h3>
                <p>{task.details}</p>
                <p className="text-sm text-gray-500">
                  Due: {task.due_date ? new Date(task.due_date).toLocaleString() : '—'}
                </p>
              </div>
            ))
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Events</h2>
          {events.length === 0 ? (
            <p className="text-gray-500">No events yet.</p>
          ) : (
            events.map(event => (
              <div key={event._id} className="p-3 border rounded mb-3">
                <h3 className="font-semibold">{event.title}</h3>
                <p>{event.notes}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.start).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Course;
