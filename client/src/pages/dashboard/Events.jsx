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
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        extendedProps: {
          notes: e.notes,
          course_id: e.course_id
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
      const res = await api.post('/api/events', createForm);

      setEvents(prev => [
        ...prev,
        {
          id: res.data.id,
          title: res.data.title,
          start: res.data.start,
          end: res.data.end,
          extendedProps: {
            notes: res.data.notes,
            course_id: res.data.course_id
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
                  course_id: res.data.course_id
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
      await api.delete(`/api/events/${selectedEvent.id}`);
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
      course_id: courses[0]?.id || '',
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

      {/* CREATE + EDIT MODALS */}
      {/* JSX unchanged — your modal code is already solid */}
    </div>
  );
};

export default Events;
