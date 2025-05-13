import React from 'react';
import { NavLink } from 'react-router-dom';
import { IoIosHome, IoIosSettings } from 'react-icons/io';

const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${
              isActive ? 'text-blue-600' : 'text-neutral-500'
            }`
          }
        >
          <IoIosHome size={24} color="currentColor" />
          <span className="text-xs mt-1">Tasks</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${
              isActive ? 'text-blue-600' : 'text-neutral-500'
            }`
          }
        >
          <IoIosSettings size={24} color="currentColor" />
          <span className="text-xs mt-1">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNavigation;