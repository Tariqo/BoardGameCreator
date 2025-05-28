import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from '../components/Layout/ProfileLayout';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ this replaces any localStorage/sessionStorage check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">You’re not logged in</h2>
          <p className="text-gray-500">
            Please <a href="/login" className="text-green-600 underline">sign in</a> to access your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout
      rightPanel={
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Previous games</h2>
          <ul className="space-y-4">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex gap-3 items-center">
                <div className="w-12 h-16 bg-gray-200 rounded-md shadow-inner flex items-center justify-center text-xs text-gray-500">
                  Img
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-800 font-medium">1m ago</p>
                  <p className="text-gray-600">Game title</p>
                  <p className="text-gray-400 text-xs">Quick summary</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.username}</h1>
        <p className="text-gray-500 text-sm">Community profile</p>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-4 text-gray-800">Saved Projects</h2>
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl h-40 shadow-sm flex items-center justify-center text-gray-400 text-sm"
            >
              Image
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-4 mt-8">
        <button
          className="bg-green-500 hover:bg-green-600 transition text-white font-medium px-5 py-2 rounded-lg shadow"
          onClick={() => navigate('/editor')}
        >
          Create New Game
        </button>
        <button className="bg-green-500 hover:bg-green-600 transition text-white font-medium px-5 py-2 rounded-lg shadow">
          Explore Community
        </button>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;
