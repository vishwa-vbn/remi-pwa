import React from 'react';
import { MdExitToApp } from 'react-icons/md';

const SettingsView = ({
  selectedPeriod,
  open,
  setOpen,
  setSelectedPeriod,
  notificationsEnabled,
  toggleNotifications,
  handleClearData,
  handleLogout,
}) => {
  return (
    <div className="flex flex-col min-h-screen p-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
      <hr className="border-gray-300 mb-6" />

      <h2 className="text-lg font-medium text-gray-900 mb-3">Data Management</h2>
      <div className="flex items-center justify-between mb-3">
        <span className="text-base text-gray-900">Clear Data Older Than</span>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-gray-900 rounded px-2 py-1 text-sm w-32"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>
      <button
        onClick={handleClearData}
        className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-900 w-fit hover:bg-gray-700"
      >
        Clear Data
      </button>
      <hr className="border-gray-300 my-6" />

      <h2 className="text-lg font-medium text-gray-900 mb-3">Notifications</h2>
      <div className="flex items-center justify-between mb-3">
        <span className="text-base text-gray-900">Enable Notifications</span>
        <input
          type="checkbox"
          checked={notificationsEnabled}
          onChange={(e) => toggleNotifications(e.target.checked)}
          className="h-5 w-5 text-gray-600"
        />
      </div>
      <hr className="border-gray-300 my-6" />

      <button
        onClick={handleLogout}
        className="flex items-center text-base font-semibold text-gray-900 hover:text-gray-700"
      >
        <MdExitToApp className="mr-2" size={25} />
        Logout
      </button>
    </div>
  );
};

export default SettingsView;