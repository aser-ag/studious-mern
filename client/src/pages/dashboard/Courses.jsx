// client/src/pages/dashboard/Courses.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));

      if (!user?.token) {
        window.location.href = '/login';
        return;
      }

      axios.defaults.headers.common.Authorization = `Bearer ${user.token}`;
      const res = await axios.get('/api/courses');
      setCourses(res.data);
    } catch (err) {
      setError('Failed to load courses');
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/courses', { title, description });
      setCourses([res.data, ...courses]);
      setTitle('');
      setDescription('');
      setShowCreateModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      const res = await axios.put(`/api/courses/${editingCourse._id}`, {
        title,
        description
      });

      setCourses(courses.map(c =>
        c._id === editingCourse._id ? res.data : c
      ));

      setEditingCourse(null);
      setTitle('');
      setDescription('');
      setShowEditModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Delete this course?')) return;

    try {
      await axios.delete(`/api/courses/${courseId}`);
      setCourses(courses.filter(c => c._id !== courseId));
      setOpenMenuId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description || '');
    setShowEditModal(true);
  };

  if (loading) {
    return <div className="p-6 animate-pulse h-40 bg-gray-100 rounded" />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Courses</h1>

      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-primary-300 text-white px-4 py-2 rounded mb-4"
      >
        + Add New Course
      </button>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {courses.length === 0 ? (
        <p className="text-gray-500">No courses yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course._id} className="relative p-4 rounded shadow bg-white">
              <div className="flex justify-end">
                <button onClick={() => setOpenMenuId(openMenuId === course._id ? null : course._id)}>
                  ⋮
                </button>
              </div>

              {openMenuId === course._id && (
                <div className="absolute right-2 top-8 bg-white border rounded shadow">
                  <button
                    onClick={() => openEditModal(course)}
                    className="block px-3 py-2 hover:bg-gray-100 w-full text-left"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="block px-3 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    Delete
                  </button>
                </div>
              )}

              <Link to={`/app/course/${course._id}`}>
                <h2 className="font-semibold text-lg mt-4">{course.title}</h2>
                <p className="text-gray-600 mt-2">{course.description}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Created: {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* CREATE + EDIT MODALS (unchanged markup, just handlers wired) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form onSubmit={handleCreateCourse} className="bg-white p-6 rounded w-96">
            <h2 className="font-bold mb-4">Create Course</h2>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 mb-3" required />
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 mb-4" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button type="submit" className="bg-primary-300 text-white px-4 py-2 rounded">Save</button>
            </div>
          </form>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form onSubmit={handleEditCourse} className="bg-white p-6 rounded w-96">
            <h2 className="font-bold mb-4">Edit Course</h2>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 mb-3" required />
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 mb-4" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button type="submit" className="bg-success-500 text-white px-4 py-2 rounded">Update</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Courses;
