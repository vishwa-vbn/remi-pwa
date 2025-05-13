import React, { useMemo, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment';
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import CustomTimeline from '../../../common/customTimeline';
import TaskModal from '../../../common/TaskModal'; // Assume a modal component for task input

const TaskView = ({
  selectedDate,
  modalVisible,
  taskModalVisible,
  currentTask,
  onDateChange,
  changeDay,
  setModalVisible,
  setTaskModalVisible,
  handleTaskSubmit,
  handleEditTask,
  handleDeleteTask,
  tasks,
  user,
  newTaskCount,
  updatedTaskCount,
}) => {
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(
      (task) => moment(task.timestamp).format('YYYY-MM-DD') === selectedDate
    );
  }, [tasks, selectedDate]);

  const handleSetModalVisible = useCallback((visible) => {
    setModalVisible(visible);
  }, [setModalVisible]);

  const handleSetTaskModalVisible = useCallback((visible) => {
    setTaskModalVisible(visible);
  }, [setTaskModalVisible]);

  const handleChangeDay = useCallback((days) => {
    changeDay(days);
  }, [changeDay]);

  return (
    <div className="flex flex-col min-h-screen p-4 bg-white">
      <div className="flex items-center justify-between mb-4 bg-gray-100 rounded-xl p-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => handleChangeDay(-1)} className="p-2">
            <FaChevronLeft size={22} />
          </button>
          <button onClick={() => handleSetModalVisible(true)}>
            <span className="text-lg font-bold text-gray-900">
              {moment(selectedDate).format('MMMM D, YYYY')}
            </span>
          </button>
          <button onClick={() => handleChangeDay(1)} className="p-2">
            <FaChevronRight size={22} />
          </button>
        </div>
        <button
          onClick={() => handleSetTaskModalVisible(true)}
          className="bg-gray-900 text-white p-3 rounded-xl relative"
        >
          <FaPlus size={28} />
          {(newTaskCount > 0 || updatedTaskCount > 0) && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {newTaskCount + updatedTaskCount}
            </span>
          )}
        </button>
      </div>

      <CustomTimeline
        tasks={filteredTasks}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        newTaskCount={newTaskCount}
        updatedTaskCount={updatedTaskCount}
      />

      {modalVisible && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-95 flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl border border-gray-300 w-11/12 max-w-md">
            <Calendar
              onChange={onDateChange}
              value={new Date(selectedDate)}
              className="border-0"
            />
            <button
              onClick={() => handleSetModalVisible(false)}
              className="mt-3 bg-gray-100 text-gray-900 px-4 py-2 rounded border border-gray-300 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <TaskModal
        visible={taskModalVisible}
        onClose={() => handleSetTaskModalVisible(false)}
        onSubmit={handleTaskSubmit}
        initialData={currentTask}
        userId={user?.id}
      />
    </div>
  );
};

export default React.memo(TaskView);