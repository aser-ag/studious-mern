// client/src/pages/dashboard/Tasks.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: '',
    details: '',
    course_id: '',
    due_date: ''
  });

  const [editForm, setEditForm] = useState({
    id: '',
    title: '',
    details: '',
    course_id: '',
    status: 'todo',
    due_date: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;

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
    fetchTasksAndCourses();
  }, []);

  const fetchTasksAndCourses = async () => {
    try {
      setLoading(true);

      const [tasksRes, coursesRes] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/courses')
      ]);

      setTasks(tasksRes.data);
      setCourses(coursesRes.data);

      if (coursesRes.data.length > 0) {
        setCreateForm(f => ({ ...f, course_id: coursesRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load tasks');

      if (err.response?.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CREATE ---------------- */

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/tasks', {
        ...createForm,
        status: 'todo'
      });

      setTasks(prev => [res.data, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        details: '',
        course_id: courses[0]?.id || '',
        due_date: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  /* ---------------- UPDATE ---------------- */

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/api/tasks/${editForm.id}`, editForm);

      setTasks(prev =>
        prev.map(t => (t.id === editForm.id ? res.data : t))
      );

      setShowEditModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task');
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  /* ---------------- MODALS ---------------- */

  const openEditModal = (task) => {
    setEditForm({
      id: task.id,
      title: task.title,
      details: task.details || '',
      course_id: task.course_id,
      status: task.status,
      due_date: task.due_date ? task.due_date.slice(0, 16) : ''
    });
    setShowEditModal(true);
  };

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 w-1/4 rounded" />
        <div className="h-24 bg-gray-100 rounded" />
        <div className="h-24 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-text-600 text-2xl font-bold mb-4">Your Tasks</h1>

      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-primary-300 text-white px-4 py-2 rounded hover:bg-primary-400 mb-4"
      >
        + Add New Task
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-gray-600">No tasks yet.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map(task => {
            const course = courses.find(c => c.id === task.course_id);

            return (
              <li
                key={task.id}
                className="mr-40 p-4 hover:bg-secondary-50 rounded shadow transition"
              >
                <div className="flex justify-between">
                  <h2 className="font-semibold text-lg">{task.title}</h2>

                  <div className="flex gap-4">
                    <button onClick={() => openEditModal(task)}>✏️</button>
                    <button onClick={() => handleDeleteTask(task.id)}>🗑</button>
                  </div>
                </div>

                <p className="mt-2 whitespace-pre-line">{task.details}</p>
                <p className="text-sm">Course: {course?.title}</p>
                <p className="text-sm">Status: {task.status.replace('_', ' ')}</p>
                <p className="text-sm">
                  Due: {task.due_date ? new Date(task.due_date).toLocaleString() : 'None'}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {/* CREATE + EDIT MODALS (unchanged JSX, already correct) */}
      {/* Your modal JSX stays EXACTLY as you wrote it */}
    </div>
  );
};

export default Tasks;
