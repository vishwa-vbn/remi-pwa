// src/components/CustomHeader.jsx
import React from 'react';
import { useSelector } from 'react-redux';

const CustomHeader = () => {
  const user = useSelector((state) => state.auth.user);
  const displayName = user?.name || 'User';
  const photoURL = user?.picture || user?.profileURL; // Fallback to profileURL if picture is not available

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning 🌅';
    } else if (hour < 18) {
      return 'Good afternoon ☀️';
    } else {
      return 'Good evening 🌙';
    }
  };

  const greeting = getGreeting();

  return (
    <div className="w-screen h-20 bg-white py-4 px-4 sm:px-6 shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo and Greeting */}
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ReMi</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {greeting} | Welcome {displayName}
          </p>
        </div>
        {/* Avatar */}
        {photoURL && (
          <img
            src={photoURL}
            alt="User avatar"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-200 object-cover"
          />
        )}
      </div>
    </div>
  );
};

export default CustomHeader;