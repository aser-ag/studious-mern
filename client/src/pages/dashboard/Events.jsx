// client/src/pages/dashboard/Events.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [createForm, setCreateForm] = useState({
    title: '',
    course_id: '',
    notes: '',
    start: '',
    end: ''
  });

  const [editForm, setEditForm] = useState({
    id: '',
    title: '',
    notes: '',
    start: '',
    end: ''
  });

  const calendarRef = useRef(null);

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
    fetchEventsAndCourses();
  }, []);

  const fetchEventsAndCourses = async () => {
    try {
      setLoading(true);

      const [eventsRes, coursesRes] = await Promise.all([
        api.get('/api/events'),
        api.get('/api/courses')
      ]);

      const formatted = eventsRes.data.map(e => ({
        id: e._id,
        title: e.title,
        start: e.start,
        end: e.end,
        extendedProps: {
          notes: e.notes,
          course_id: e.course
        }
      }));

      setEvents(formatted);
      setCourses(coursesRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load events');

      if (err.response?.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CREATE ---------------- */

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: createForm.title,
        course: createForm.course_id,
        notes: createForm.notes,
        start: createForm.start,
        end: createForm.end
      };
      const res = await api.post('/api/events', payload);

      setEvents(prev => [
        ...prev,
        {
          id: res.data._id,
          title: res.data.title,
          start: res.data.start,
          end: res.data.end,
          extendedProps: {
            notes: res.data.notes,
            course_id: res.data.course
          }
        }
      ]);

      setCreateForm({
        title: '',
        course_id: '',
        notes: '',
        start: '',
        end: ''
      });

      setShowCreateModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    }
  };

  /* ---------------- UPDATE ---------------- */

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/api/events/${editForm.id}`, editForm);

      setEvents(prev =>
        prev.map(ev =>
          ev.id === editForm.id
            ? {
              ...ev,
              title: res.data.title,
              start: res.data.start,
              end: res.data.end,
              extendedProps: {
                notes: res.data.notes,
                course_id: res.data.course
              }
            }
            : ev
        )
      );

      setShowEditModal(false);
      setSelectedEvent(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update event');
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !window.confirm('Delete this event?')) return;

    try {
      await api.delete(`/api/events/${selectedEvent.id}`); // This comes from FullCalendar event object, so check if it mapped _id to id or extendedProps._id
      // FullCalendar events utilize 'id' string.
      // In formatted (line 65), we mapped id: e._id. So selectedEvent.id IS the _id.
      // So this chunk is actually fine IF line 65 is fixed. But I should check if I need to change anything else.
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      setShowEditModal(false);
      setSelectedEvent(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  /* ---------------- CALENDAR ---------------- */

  const handleDateClick = (info) => {
    const dateStr = info.dateStr;
    setCreateForm({
      title: '',
      course_id: courses[0]?._id || '',
      notes: '',
      start: dateStr,
      end: dateStr
    });
    setShowCreateModal(true);
  };

  const handleEventClick = (info) => {
    const ev = info.event;

    setSelectedEvent({ id: ev.id });

    setEditForm({
      id: ev.id,
      title: ev.title,
      notes: ev.extendedProps?.notes || '',
      start: ev.start ? ev.start.toISOString().slice(0, 16) : '',
      end: ev.end ? ev.end.toISOString().slice(0, 16) : ''
    });

    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 mx-auto" />
        <div className="bg-white rounded-2xl shadow p-4 h-[80vh]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">My Events</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 text-center">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-300 text-white px-4 py-2 rounded hover:bg-primary-400"
        >
          + Create New Event
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 h-[80vh]">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          editable
          selectable
          nowIndicator
          height="100%"
        />
      </div>

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Title</label>
                <input type="text" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Course</label>
                <select value={createForm.course_id} onChange={e => setCreateForm({ ...createForm, course_id: e.target.value })} className="w-full border rounded p-2">
                  <option value="">None</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Description</label>
                <textarea value={createForm.notes} onChange={e => setCreateForm({ ...createForm, notes: e.target.value })} className="w-full border rounded p-2"></textarea>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Start</label>
                <input type="datetime-local" value={createForm.start} onChange={e => setCreateForm({ ...createForm, start: e.target.value })} className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">End</label>
                <input type="datetime-local" value={createForm.end} onChange={e => setCreateForm({ ...createForm, end: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
                <button type="submit" className="bg-primary-300 text-white px-4 py-2 rounded hover:bg-primary-400">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Event</h2>
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Title</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Description</label>
                <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} className="w-full border rounded p-2"></textarea>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Start</label>
                <input type="datetime-local" value={editForm.start} onChange={e => setEditForm({ ...editForm, start: e.target.value })} className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">End</label>
                <input type="datetime-local" value={editForm.end} onChange={e => setEditForm({ ...editForm, end: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={handleDeleteEvent} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
                <div className="space-x-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-success-500 text-white rounded hover:bg-success-600">Update</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
