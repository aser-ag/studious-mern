// client/src/pages/dashboard/Courses.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Menu state
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Close menu when clicking outside (handled via transparent overlay or simple toggle logic)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.course-menu-btn') && !e.target.closest('.course-menu-dropdown')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) return;
      axios.defaults.headers.common.Authorization = `Bearer ${user.token}`;
      const res = await axios.get('/api/courses');
      setCourses(res.data);
    } catch (err) {
      setError('Failed to load courses');
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
      const res = await axios.put(`/api/courses/${editingCourse._id}`, { title, description });
      setCourses(courses.map(c => c._id === editingCourse._id ? res.data : c));
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
    setOpenMenuId(null);
  };

  if (loading) return <div className="p-6 animate-pulse h-40 bg-gray-100 rounded" />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Courses</h1>

      <button
        onClick={() => { setTitle(''); setDescription(''); setShowCreateModal(true); }}
        className="bg-primary-300 text-white px-4 py-2 rounded mb-4 hover:bg-primary-400 decoration-0"
      >
        + Add New Course
      </button>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {courses.length === 0 ? (
        <p className="text-gray-500">No courses yet. Add one!</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course._id} className="relative rounded shadow-md mt-2 p-4 bg-gradient-to-br from-secondary-25 to-secondary-50 hover:from-secondary-50 hover:to-secondary-75 transition-all duration-300 transform hover:-translate-y-1 hover:border hover:border-secondary-400">

              {/* Menu Button */}
              <div className="flex justify-end relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === course._id ? null : course._id); }}
                  className="course-menu-btn p-1 rounded hover:bg-gray-200 focus:outline-none"
                >
                  <img src="/assets/icons/menu.svg" alt="Menu" className="w-5 h-5" />
                </button>

                {/* Dropdown */}
                {openMenuId === course._id && (
                  <div className="course-menu-dropdown absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <button
                      onClick={() => openEditModal(course)}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <Link to={`/app/courses/${course._id}`} className="block">
                <div>
                  <img src="/assets/icons/listed_course.svg" alt="" className="w-10 h-10 mt-2 mb-2" />
                </div>
                <h2 className="font-semibold text-lg">{course.title}</h2>
                <p className="text-sm text-text-500 mt-1 line-clamp-2">{course.description}</p>
                <p className="text-xs text-text-400 mt-2">
                  Created: {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Course</h2>
            <form onSubmit={handleCreateCourse}>
              <div className="mb-3">
                <label className="block mb-1">Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-300"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Description:</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-300"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="bg-primary-300 text-white px-4 py-2 rounded hover:bg-primary-400">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Course</h2>
            <form onSubmit={handleEditCourse}>
              <div className="mb-3">
                <label className="block mb-1">Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-300"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Description:</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-300"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
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

export default Courses;
