// client/src/pages/Home.jsx
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center text-white font-sans"
         style={{
           background: 'linear-gradient(-45deg, hsla(240, 100%, 19%, 1.00), hsla(240, 100%, 16%, 1.00), hsla(240, 100%, 13%, 1.00), hsla(240, 100%, 10%, 1.00))',
           backgroundSize: '400% 400%',
           animation: 'gradientShift 14s ease infinite'
         }}>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      
      <main className="text-center max-w-lg p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Studious</h1>
        <p className="text-lg mb-6 text-white/90">
          Your all-in-one study manager.  
          Stay organized, focused, and ahead — effortlessly.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border border-white/80 text-white font-semibold rounded-lg hover:bg-white/10 transition transform hover:scale-105"
          >
            Log In
          </Link>
        </div>

        <p className="mt-8 text-sm text-white/80">
          Built for learners, dreamers, and doers.
        </p>
      </main>
    </div>
  );
};

export default Home;