// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Courses from './pages/dashboard/Courses';
import Course from './pages/dashboard/Course'; // ADD THIS IMPORT
import Tasks from './pages/dashboard/Tasks';
import Events from './pages/dashboard/Events';
import Profile from './pages/dashboard/Profile';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes - All under /app */}
        <Route path="/app" element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }>
          <Route index element={<Navigate replace to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<Course />} /> {/* ADD THIS ROUTE */}
          <Route path="tasks" element={<Tasks />} />
          <Route path="events" element={<Events />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;