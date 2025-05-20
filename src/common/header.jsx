import React from "react";
import { useSelector } from "react-redux";

const CustomHeader = ({ className }) => {
  const user = useSelector((state) => state.auth.user);
  const displayName = user?.name || "User";
  const photoURL = user?.picture || user?.profileURL;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning 🌅";
    } else if (hour < 18) {
      return "Good afternoon ☀️";
    } else {
      return "Good evening 🌙";
    }
  };

  const greeting = getGreeting();

  return (
    <div
      className={`w-full bg-white py-4 px-4 sm:px-6  h-[10%] flex flex-col justify-center ${className}`}
      style={{
        
      }}
    >
      <div className="flex justify-between items-center mx-auto w-full ">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">ReMi</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {greeting} | Welcome {displayName}
          </p>
        </div>
        {photoURL && (
          <img
            src={photoURL}
            alt="User avatar"
            className="w-10 h-10 sm:w-10 sm:h-10 rounded-full border border-gray-200 object-cover"
          />
        )}
      </div>
    </div>
  );
};

export default CustomHeader;