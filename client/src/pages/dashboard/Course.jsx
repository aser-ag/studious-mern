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

  // Stats
  const [statusCounts, setStatusCounts] = useState({ todo: 0, in_progress: 0, done: 0 });

  // Modals state
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);

  // Edit/Create state holders
  const [editingTask, setEditingTask] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editedCourseData, setEditedCourseData] = useState({ title: '', description: '' });

  // Task Form
  const [taskForm, setTaskForm] = useState({ title: '', details: '', due_date: '', status: 'todo' });
  // Event Form
  const [eventForm, setEventForm] = useState({ title: '', notes: '', start: '', end: '' });

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) { navigate('/login'); return; }
      axios.defaults.headers.common.Authorization = `Bearer ${user.token}`;

      const [cRes, tRes, eRes] = await Promise.all([
        axios.get(`/api/courses/${id}`),
        axios.get(`/api/tasks?course_id=${id}`),
        axios.get(`/api/events?course_id=${id}`)
      ]);

      setCourse(cRes.data);
      setTasks(tRes.data);
      setEvents(eRes.data);

      const counts = { todo: 0, in_progress: 0, done: 0 };
      tRes.data.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++ });
      setStatusCounts(counts);

      setEditedCourseData({ title: cRes.data.title, description: cRes.data.description });

    } catch (err) {
      console.error(err);
      alert('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  /* --- COURSE ACTIONS --- */
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/courses/${id}`, editedCourseData);
      setCourse(res.data);
      setShowEditCourseModal(false);
    } catch (err) { alert('Failed to update course'); }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('Delete this course?')) return;
    try {
      await axios.delete(`/api/courses/${id}`);
      navigate('/app/courses');
    } catch (err) { alert('Failed to delete course'); }
  };

  /* --- TASK ACTIONS --- */
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: taskForm.title,
        details: taskForm.details,
        course: id, // id from useParams
        dueDate: taskForm.due_date,
        status: taskForm.status
      };
      const res = await axios.post('/api/tasks', payload);
      setTasks([...tasks, res.data]);
      setShowCreateTaskModal(false);
      setTaskForm({ title: '', details: '', due_date: '', status: 'todo' });
      fetchCourseData(); // refresh stats
    } catch (err) { alert('Failed to create task'); }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      const payload = {
        title: taskForm.title,
        details: taskForm.details,
        dueDate: taskForm.due_date,
        status: taskForm.status,
        course: id // Ensure course is maintained
      };
      const res = await axios.put(`/api/tasks/${editingTask._id}`, payload);
      setTasks(tasks.map(t => t._id === editingTask._id ? res.data : t));
      setShowEditTaskModal(false);
      setEditingTask(null);
      fetchCourseData(); // refresh stats
    } catch (err) { alert('Failed to update task'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      fetchCourseData(); // refresh stats
    } catch (err) { alert('Failed to delete task'); }
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      details: task.details || '',
      due_date: task.dueDate ? task.dueDate.slice(0, 16) : '', // Assuming ISO string for datetime-local
      status: task.status
    });
    setShowEditTaskModal(true);
  };

  /* --- EVENT ACTIONS --- */
  // NOTE: There is no "Create Event" in reference course.php (only list and edit).
  // But listed_event.svg implies listing. And logic implies create should be possible somewhere?
  // courses.php reference has no create event.
  // Actually, dashboard has "Events" link. Maybe create there?
  // But let's verify if user wants Create Event here. Current Course.jsx has Events list.
  // I will add Create Event logic to match functional parity with Tasks, or just stick to Edit if pure reference port.
  // Reference `course.php` did NOT have "Add Event", only "Audio/Task". Wait.
  // Reference `course.php` line 148 "Events".
  // Reference has `editEventModal` and `deleteEvent`.
  // But NO "Add Event" button in the HTML structure I saw.
  // I will implement Edit/Delete for now.

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const res = await axios.put(`/api/events/${editingEvent._id}`, eventForm);
      setEvents(events.map(ev => ev._id === editingEvent._id ? res.data : ev));
      setShowEditEventModal(false);
      setEditingEvent(null);
    } catch (err) { alert('Failed to update event'); }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Delete this event?')) return;
    try {
      await axios.delete(`/api/events/${eventId}`);
      setEvents(events.filter(e => e._id !== eventId));
    } catch (err) { alert('Failed to delete event'); }
  };

  const openEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      notes: event.notes || '',
      start: event.start ? event.start.slice(0, 16) : '',
      end: event.end ? event.end.slice(0, 16) : ''
    });
    setShowEditEventModal(true);
  };

  if (loading) return <div className="p-6 animate-pulse h-40 bg-gray-100 rounded" />;

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <div>
        <button onClick={() => navigate('/app/courses')} className="w-7 h-7 hover:scale-110 transition">
          <img src="/assets/icons/back_button.svg" alt="Back" />
        </button>
      </div>

      {/* Header */}
      <div>
        <div className="flex gap-6 items-center">
          <h1 className="inline text-3xl font-bold text-text-400">{course?.title}</h1>
          <div className="inline flex gap-3">
            <button onClick={() => setShowEditCourseModal(true)}>
              <img src="/assets/icons/edit_task.svg" className="w-7 h-7 hover:scale-105 duration-150 transition-all" alt="Edit" />
            </button>
            <button onClick={handleDeleteCourse}>
              <img src="/assets/icons/delete_task.svg" className="w-7 h-7 hover:scale-105 duration-200 transition-all" alt="Delete" />
            </button>
          </div>
        </div>
        <p className="text-text-300 max-w-2xl mt-2 whitespace-pre-line">{course?.description}</p>
      </div>

      {/* Task Summary */}
      <div className="flex gap-6 text-sm mt-4">
        <span className="text-red-500 font-medium">To-Do: {statusCounts.todo}</span>
        <span className="text-blue-500 font-medium">In Progress: {statusCounts.in_progress}</span>
        <span className="text-green-500 font-medium">Done: {statusCounts.done}</span>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">

        {/* Tasks Section */}
        <div>
          <h2 className="text-2xl font-semibold text-text-600 mb-3 flex items-center gap-2">
            <img src="/assets/icons/listed_task.svg" className="w-6 h-6" alt="" /> Tasks
          </h2>

          <p className="mb-4">
            <button
              onClick={() => { setTaskForm({ title: '', details: '', due_date: '', status: 'todo' }); setShowCreateTaskModal(true); }}
              className="bg-primary-300 text-white px-4 py-2 rounded hover:bg-primary-400"
            >
              + Add New Task
            </button>
          </p>

          {tasks.length === 0 ? (
            <p className="text-text-400 italic">No tasks for this course yet.</p>
          ) : (
            <ul className="space-y-4">
              {tasks.map(task => (
                <li key={task._id} className="mr-5 p-4 hover:bg-secondary-50 rounded shadow hover:scale-100 duration-200 transition-all bg-white relative border border-secondary-100">
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <img src="/assets/icons/listed_task.svg" alt="" className="w-6 h-6" />
                      <h3 className="text-text-600 font-semibold text-lg">{task.title}</h3>
                    </div>
                    <div className="flex justify-end gap-4">
                      <button onClick={() => openEditTask(task)}>
                        <img src="/assets/icons/edit_task.svg" alt="" className="w-5 h-5 hover:scale-105 duration-150 transition-all" />
                      </button>
                      <button onClick={() => handleDeleteTask(task._id)}>
                        <img src="/assets/icons/delete_task.svg" alt="" className="w-5 h-5 hover:scale-105 duration-200 transition-all" />
                      </button>
                    </div>
                  </div>
                  <p className="text-text-500 mt-2 whitespace-pre-line">{task.details}</p>
                  <p className="text-sm text-text-500 mt-1">Status: <span className="capitalize">{task.status.replace('_', ' ')}</span></p>
                  <p className="text-sm text-text-500">Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'None'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Events Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
            <img src="/assets/icons/listed_event.svg" className="w-6 h-6" alt="" />Events
          </h2>

          {/* Reference didn't have Add Event button, but we can verify later if needed. */}

          {events.length === 0 ? (
            <p className="text-text-400 italic">No events yet.</p>
          ) : (
            <ul className="space-y-4">
              {events.map(ev => (
                <li key={ev._id} className="mr-5 p-4 hover:bg-secondary-50 rounded shadow hover:scale-100 duration-200 transition-all bg-white border border-secondary-100">
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <img src="/assets/icons/listed_event.svg" className="w-5 h-5" alt="" />
                      <h3 className="font-semibold">{ev.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditEvent(ev)}>
                        <img src="/assets/icons/edit_task.svg" className="w-5 h-5 hover:scale-105 transition" alt="" />
                      </button>
                      <button onClick={() => handleDeleteEvent(ev._id)}>
                        <img src="/assets/icons/delete_task.svg" className="w-5 h-5 hover:scale-105 transition" alt="" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-text-500 mt-1 whitespace-pre-line">{ev.notes}</p>
                  <p className="text-xs text-text-400 mt-1">
                    {ev.start ? new Date(ev.start).toLocaleString() : ''} — {ev.end ? new Date(ev.end).toLocaleString() : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* EDIT COURSE MODAL */}
      {showEditCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Course</h2>
            <form onSubmit={handleUpdateCourse}>
              <div className="mb-3">
                <label className="block mb-1">Title:</label>
                <input type="text" value={editedCourseData.title} onChange={e => setEditedCourseData({ ...editedCourseData, title: e.target.value })} className="w-full border p-2 rounded" required />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Description:</label>
                <textarea value={editedCourseData.description} onChange={e => setEditedCourseData({ ...editedCourseData, description: e.target.value })} className="w-full border p-2 rounded"></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEditCourseModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-success-500 text-white rounded hover:bg-success-600">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="mb-3">
                <label className="block mb-1">Title:</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full border p-2 rounded" required />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Details:</label>
                <textarea value={taskForm.details} onChange={e => setTaskForm({ ...taskForm, details: e.target.value })} className="w-full border p-2 rounded"></textarea>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Due Date:</label>
                <input type="datetime-local" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} className="w-full border p-2 rounded" />
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowCreateTaskModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="bg-primary-300 text-white px-4 py-2 rounded hover:bg-primary-400">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {showEditTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>
            <form onSubmit={handleUpdateTask}>
              <div className="mb-3">
                <label className="block mb-1">Title:</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full border p-2 rounded" required />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Details:</label>
                <textarea value={taskForm.details} onChange={e => setTaskForm({ ...taskForm, details: e.target.value })} className="w-full border p-2 rounded"></textarea>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Status:</label>
                <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })} className="w-full border p-2 rounded">
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Due Date:</label>
                <input type="datetime-local" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} className="w-full border p-2 rounded" />
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEditTaskModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {showEditEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Event</h2>
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div>
                <label className="block mb-1">Title</label>
                <input type="text" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block mb-1">Notes</label>
                <textarea value={eventForm.notes} onChange={e => setEventForm({ ...eventForm, notes: e.target.value })} className="w-full border rounded p-2"></textarea>
              </div>
              <div>
                <label className="block mb-1">Start</label>
                <input type="datetime-local" value={eventForm.start} onChange={e => setEventForm({ ...eventForm, start: e.target.value })} className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block mb-1">End</label>
                <input type="datetime-local" value={eventForm.end} onChange={e => setEventForm({ ...eventForm, end: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" onClick={() => setShowEditEventModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-400 text-white rounded">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Course;
