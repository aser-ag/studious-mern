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
        setCreateForm(f => ({ ...f, course_id: coursesRes.data[0]._id }));
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
        title: createForm.title,
        details: createForm.details,
        course: createForm.course_id,
        dueDate: createForm.due_date,
        status: 'todo'
      });

      setTasks(prev => [res.data, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        details: '',
        course_id: courses[0]?._id || '',
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
      const payload = {
        title: editForm.title,
        details: editForm.details,
        course: editForm.course_id,
        status: editForm.status,
        dueDate: editForm.due_date
      };
      const res = await api.put(`/api/tasks/${editForm.id}`, payload);

      setTasks(prev =>
        prev.map(t => (t._id === editForm.id ? res.data : t))
      );

      setShowEditModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task');
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDeleteTask = async (e, id) => { // Added event argument
    e.stopPropagation(); // Stop propagation
    // Check if confirm returns true
    if (!window.confirm('Delete this task?')) return;

    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  /* ---------------- MODALS ---------------- */

  const openEditModal = (task) => {
    setEditForm({
      id: task._id,
      title: task.title,
      details: task.details || '',
      course_id: task.course,
      status: task.status,
      due_date: task.dueDate ? task.dueDate.slice(0, 16) : ''
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
            const course = courses.find(c => c._id === task.course);

            return (
              <li
                key={task._id}
                className="mr-40 p-4 hover:bg-secondary-50 rounded shadow transition"
              >
                <div className="flex justify-between">
                  <h2 className="font-semibold text-lg">{task.title}</h2>

                  <div className="flex gap-4">
                    <div className="flex gap-4">
                      <button onClick={() => openEditModal(task)}>
                        <img src="/assets/icons/edit_task.svg" alt="Edit" className="w-5 h-5 hover:scale-105 duration-150 transition-all" />
                      </button>
                      <button type="button" onClick={(e) => handleDeleteTask(e, task._id)}>
                        <img src="/assets/icons/delete_task.svg" alt="Delete" className="w-5 h-5 hover:scale-105 duration-200 transition-all" />
                      </button>
                    </div>
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

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="mb-3">
                <label className="block mb-1">Course:</label>
                <select
                  value={createForm.course_id}
                  onChange={e => setCreateForm({ ...createForm, course_id: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                >
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Title:</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Details:</label>
                <textarea
                  value={createForm.details}
                  onChange={e => setCreateForm({ ...createForm, details: e.target.value })}
                  className="w-full border p-2 rounded"
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Due Date:</label>
                <input
                  type="datetime-local"
                  value={createForm.due_date}
                  onChange={e => setCreateForm({ ...createForm, due_date: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="bg-primary-300 text-white px-4 py-2 rounded hover:bg-primary-400">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>
            <form onSubmit={handleUpdateTask}>
              <div className="mb-3">
                <label className="block mb-1">Course:</label>
                <select
                  value={editForm.course_id}
                  onChange={e => setEditForm({ ...editForm, course_id: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                >
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Title:</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Details:</label>
                <textarea
                  value={editForm.details}
                  onChange={e => setEditForm({ ...editForm, details: e.target.value })}
                  className="w-full border p-2 rounded"
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Status:</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Due Date:</label>
                <input
                  type="datetime-local"
                  value={editForm.due_date}
                  onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-success-500 text-white rounded hover:bg-success-600">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
