import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker'; // Using react-datepicker for separate pickers
import ToggleButton from 'react-toggle-button';
import 'react-datepicker/dist/react-datepicker.css';
import { IoClose, IoCalendarOutline, IoTimeOutline, IoNotificationsOutline, IoCheckmarkCircle } from 'react-icons/io5';
import { MdOutlineTextFields, MdCheckCircleOutline } from 'react-icons/md';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css'; // Import styles for react-datepicker

const TaskModal = ({ visible, onClose, onSubmit, initialData, userId }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [alertOn, setAlertOn] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [alertMinutes, setAlertMinutes] = useState(5);

  useEffect(() => {
    if (initialData) {
      const initialTimestamp = initialData.timestamp ? new Date(initialData.timestamp) : new Date();
      setTaskTitle(initialData.title || '');
      setDate(initialTimestamp);
      setTime(initialTimestamp);
      setAlertOn(!!initialData.alertMinutes);
      setDescription(initialData.description || '');
      setNote(initialData.note || '');
      setAlertMinutes(initialData.alertMinutes || 5);
      setIsCompleted(initialData.status || false);
    } else {
      const now = new Date();
      setTaskTitle('');
      setDate(now);
      setTime(now);
      setAlertOn(false);
      setDescription('');
      setNote('');
      setAlertMinutes(5);
      setIsCompleted(false);
    }
  }, [initialData, visible]);

  const handleSubmit = useCallback(() => {
    if (!taskTitle.trim()) {
      alert('Task title is required.');
      return;
    }

    // Combine date and time into a single timestamp
    const combinedDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    const taskData = {
      title: taskTitle,
      timestamp: combinedDateTime.getTime(),
      description,
      note,
      alert: alertOn,
      notified: false,
      alertMinutes: alertOn ? alertMinutes : 0,
      status: isCompleted,
      userId,
    };

    onSubmit(taskData);
    onClose();
  }, [taskTitle, date, time, description, note, alertOn, alertMinutes, isCompleted, userId, onSubmit, onClose]);

  if (!visible) return null;

  const toggleStyles = {
    trackStyle: {
      height: 20,
      width: 40,
      borderRadius: 10,
    },
    thumbStyle: {
      height: 16,
      width: 16,
      borderRadius: '50%',
      top: 2,
      left: 2,
    },
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-90 flex items-end justify-center md:items-center">
      <div className="bg-white rounded-t-lg md:rounded-lg border border-gray-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border-b border-gray-200 rounded-t-lg">
          <h2 className="text-lg font-semibold text-black">
            {initialData ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-1 text-black hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-4 space-y-4">
          {/* Task Title */}
          <div className="flex items-center border border-black rounded-md p-2 bg-gray-100">
            <MdOutlineTextFields size={26} className="mr-2 text-black" />
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task Title"
              className="flex-1 bg-transparent text-black text-base focus:outline-none"
            />
          </div>

          {/* Date and Time Pickers in Same Row */}
          <div className="flex space-x-2">
            {/* Date Picker */}
            <div className="flex items-center border border-black rounded-md p-2 bg-gray-100 flex-1">
              <IoCalendarOutline size={23} className="mr-2 text-black" />
              <DatePicker
                selected={date}
                onChange={(newDate) => setDate(newDate)}
                dateFormat="yyyy-MM-dd"
                className="bg-transparent text-black text-base focus:outline-none w-full"
                calendarClassName="bg-white border border-gray-200 rounded-md"
              />
            </div>

            {/* Time Picker */}
            <div className="flex items-center border border-black rounded-md p-2 bg-gray-100 flex-1">
              <IoTimeOutline size={23} className="mr-2 text-black" />
              <DatePicker
                selected={time}
                onChange={(newTime) => setTime(newTime)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className="bg-transparent text-black text-base focus:outline-none w-full"
                calendarClassName="bg-white border border-gray-200 rounded-md"
              />
            </div>
          </div>

          {/* Description */}
          <div className="border border-black rounded-md p-2 bg-gray-100">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full h-20 bg-transparent text-black text-base focus:outline-none resize-none"
            />
          </div>

          {/* Note */}
          <div className="border border-black rounded-md p-2 bg-gray-100">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note"
              className="w-full h-20 bg-transparent text-black text-base focus:outline-none resize-none"
            />
          </div>

          {/* Alert Toggle */}
          <div className="flex items-center p-2">
            <IoNotificationsOutline size={24} className="mr-2 text-black" />
            <span className="flex-1 text-black text-base">Enable Alert</span>
            <ToggleButton
              value={alertOn}
              onToggle={() => setAlertOn(!alertOn)}
              colors={{
                active: { base: '#000000' },
                inactive: { base: '#808080' },
                activeThumb: { base: '#FFFFFF' },
                inactiveThumb: { base: '#FFFFFF' },
              }}
              activeLabel=""
              inactiveLabel=""
              trackStyle={toggleStyles.trackStyle}
              thumbStyle={toggleStyles.thumbStyle}
              thumbAnimateRange={[2, 22]}
            />
          </div>

          {/* Alert Options */}
          {alertOn && (
            <div className="pl-4">
              <span className="text-black text-base">Alert before:</span>
              <div className="flex space-x-2 mt-2">
                {[2, 5, 10, 15].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setAlertMinutes(minutes)}
                    className={`border border-black rounded-full px-4 py-1 text-sm ${
                      alertMinutes === minutes ? 'bg-black text-white' : 'bg-gray-100 text-black'
                    }`}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Toggle (for editing) */}
          {initialData && (
            <div className="flex items-center p-2">
              <MdCheckCircleOutline size={24} className="mr-2 text-black" />
              <span className="flex-1 text-black text-base">Mark as Completed</span>
              <ToggleButton
                value={isCompleted}
                onToggle={() => setIsCompleted(!isCompleted)}
                colors={{
                  active: { base: '#000000' },
                  inactive: { base: '#808080' },
                  activeThumb: { base: '#FFFFFF' },
                  inactiveThumb: { base: '#FFFFFF' },
                }}
                activeLabel=""
                inactiveLabel=""
                trackStyle={toggleStyles.trackStyle}
                thumbStyle={toggleStyles.thumbStyle}
                thumbAnimateRange={[2, 22]}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex items-center bg-gray-100 text-black px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center bg-gray-100 text-black px-4 py-2 rounded-md border border-black hover:bg-gray-200"
            >
              <IoCheckmarkCircle size={20} className="mr-2" />
              {initialData ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;