import React from 'react';
import { FcGoogle } from 'react-icons/fc';

const LoginView = ({ onGoogleSignIn }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-5">
      
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">
        Stay Productive, Stay Organized!
      </h1>
      <p className="text-lg text-gray-600 text-center mb-8 px-4 leading-6">
        Your personal assistant to help you remember important tasks throughout
        the day.
      </p>
      <button
        onClick={onGoogleSignIn}
        className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-700 transition"
      >
        <FcGoogle size={24} className="mr-2" />
        <span className="text-lg font-semibold">Sign in with Google</span>
      </button>
    </div>
  );
};

export default LoginView;