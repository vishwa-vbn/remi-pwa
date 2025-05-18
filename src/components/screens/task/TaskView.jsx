// import React, { useMemo, useCallback } from "react";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
// import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
// import moment from "moment";
// import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
// import CustomTimeline from "../../../common/customTimeline";
// import TaskModal from "../../../common/TaskModal";

// const TaskView = ({
//   selectedDate,
//   modalVisible,
//   taskModalVisible,
//   currentTask,
//   onDateChange,
//   changeDay,
//   setModalVisible,
//   setTaskModalVisible,
//   handleTaskSubmit,
//   handleEditTask,
//   handleDeleteTask,
//   tasks,
//   user,
//   newTaskCount,
//   updatedTaskCount,
// }) => {
//   const filteredTasks = useMemo(() => {
//     if (!Array.isArray(tasks)) {
//       console.warn("Tasks is not an array:", tasks);
//       return [];
//     }
//     const filtered = tasks.filter((task) => {
//       const taskDate = moment(task.timestamp).format("YYYY-MM-DD");
//       return taskDate === selectedDate;
//     });
//     console.log("Selected Date:", selectedDate, "Filtered Tasks:", filtered);
//     return filtered;
//   }, [tasks, selectedDate]);

//   const handleSetModalVisible = useCallback(
//     (visible) => {
//       setModalVisible(visible);
//     },
//     [setModalVisible]
//   );

//   const handleSetTaskModalVisible = useCallback(
//     (visible) => {
//       setTaskModalVisible(visible);
//     },
//     [setTaskModalVisible]
//   );

//   const handleChangeDay = useCallback(
//     (days) => {
//       const newDate = moment(selectedDate)
//         .add(days, "days")
//         .format("YYYY-MM-DD");
//       console.log("Changing day to:", newDate);
//       onDateChange(newDate);
//     },
//     [selectedDate, onDateChange]
//   );

//   const handleDateChange = useCallback(
//     (newDate) => {
//       const formattedDate = moment(newDate).format("YYYY-MM-DD");
//       console.log("Date selected from calendar:", formattedDate);
//       onDateChange(formattedDate);
//       handleSetModalVisible(false);
//     },
//     [onDateChange, handleSetModalVisible]
//   );

//   return (
//     <div className="flex flex-col h-full w-full bg-white">
//      {/* Fixed Date Navigation and Add Button */}
// <div className="sticky top-0 z-10 mx-3 sm:mx-3">
//   <div className="flex items-center justify-between bg-gray-50 rounded-full shadow-sm  border-gray-200 px-2 py-2">
//     {/* Left - Date Navigation */}
//     <div className="flex items-center flex-grow space-x-4">
//       <button
//         onClick={() => handleChangeDay(-1)}
//         className="p-2 hover:bg-gray-100 rounded-full transition"
//         aria-label="Previous day"
//       >
//         <FaChevronLeft size={16} className="text-gray-700" />
//       </button>

//       <button
//         onClick={() => handleSetModalVisible(true)}
//         className="flex-1 text-center px-2"
//       >
//         <span className="text-sm sm:text-base font-medium text-gray-800">
//           {moment(selectedDate).format("MMM D, YYYY")}
//         </span>
//       </button>

//       <button
//         onClick={() => handleChangeDay(1)}
//         className="p-2 hover:bg-gray-100 rounded-full transition"
//         aria-label="Next day"
//       >
//         <FaChevronRight size={16} className="text-gray-700" />
//       </button>
//     </div>

//     {/* Right - Add Task */}
//     <div className="flex items-center justify-end ml-2">
//       <button
//         onClick={() => handleSetTaskModalVisible(true)}
//         className="bg-gray-800 text-white p-2 flex justify-center items-center rounded-full hover:bg-gray-700 transition relative"
//         aria-label="Add task"
//       >
//         <FaPlus size={22} />
//         {(newTaskCount > 0 || updatedTaskCount > 0) && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
//             {newTaskCount + updatedTaskCount}
//           </span>
//         )}
//       </button>
//     </div>
//   </div>
// </div>


//       {/* Scrollable Timeline */}
//       <div className="flex-1 overflow-auto scrollbar-hide px-2">
//         <CustomTimeline
//           tasks={filteredTasks}
//           onEdit={handleEditTask}
//           onDelete={handleDeleteTask}
//           newTaskCount={newTaskCount}
//           updatedTaskCount={updatedTaskCount}
//         />
//       </div>

//       {/* Calendar Modal */}
//       {modalVisible && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-md">
//             <LocalizationProvider dateAdapter={AdapterMoment}>
// <DateCalendar
//   value={moment(selectedDate)}
//   onChange={handleDateChange}
//   sx={{
//     width: '100%',
//     maxWidth: '100%',
//     "& .MuiPickersCalendarHeader-root": {
//       padding: "0px 12px",
//       backgroundColor: "#f8fafc",
//       borderRadius: "8px 8px 0 0",
//       display: "flex",
//       justifyContent: "space-between",
//       alignItems: "center",
//       flexWrap: "wrap",
//     },
//     "& .MuiPickersCalendarHeader-label": {
//       flexGrow: 1,
//       textAlign: "center",
//     },
//     "& .MuiPickersArrowSwitcher-root": {
//       flexShrink: 0,
//     },
//     "& .MuiDayCalendar-weekContainer": {
//       margin: "8px 0",
//     },
//     "& .MuiPickersDay-root": {
//       fontSize: "1rem",
//       "&:hover": {
//         backgroundColor: "#e8f0fe",
//       },
//     },
//     "& .Mui-selected": {
//       backgroundColor: "#4f46e5 !important",
//       color: "#fff",
//     },

//     // ✅ Fixes for Year View Grid Layout on Mobile
//     "& .MuiYearCalendar-root": {
//       display: "grid",
//       gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
//       gap: "1px",
//       padding: "8px",
//       overflowX: "hidden",
//     },
//     "& .MuiPickersYear-yearButton": {
//       fontSize: "0.875rem",
//       padding: "8px",
//     },
//   }}
// />




//             </LocalizationProvider>
//             <button
//               onClick={() => handleSetModalVisible(false)}
//               className="mt-4 w-full bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Task Modal */}
//       <TaskModal
//         visible={taskModalVisible}
//         onClose={() => handleSetTaskModalVisible(false)}
//         onSubmit={handleTaskSubmit}
//         initialData={currentTask}
//         userId={user?.id}
//       />
//     </div>
//   );
// };

// export default React.memo(TaskView);


import React, { useMemo, useCallback, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import moment from "moment";
import { FaChevronLeft, FaChevronRight, FaPlus, FaMicrophone } from "react-icons/fa";
import CustomTimeline from "../../../common/customTimeline";
import TaskModal from "../../../common/TaskModal";
import VoiceAssistantSheet from "../../../common/VoiceAssistant";
import { motion } from "framer-motion";

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
  const [voiceAssistantVisible, setVoiceAssistantVisible] = useState(false);

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) {
      console.warn("Tasks is not an array:", tasks);
      return [];
    }
    const filtered = tasks.filter((task) => {
      const taskDate = moment(task.timestamp).format("YYYY-MM-DD");
      return taskDate === selectedDate;
    });
    console.log("Selected Date:", selectedDate, "Filtered Tasks:", filtered);
    return filtered;
  }, [tasks, selectedDate]);

  const handleSetModalVisible = useCallback(
    (visible) => {
      setModalVisible(visible);
    },
    [setModalVisible]
  );

  const handleSetTaskModalVisible = useCallback(
    (visible) => {
      setTaskModalVisible(visible);
    },
    [setTaskModalVisible]
  );




  const handleChangeDay = useCallback(
    (days) => {
      const newDate = moment(selectedDate)
        .add(days, "days")
        .format("YYYY-MM-DD");
      console.log("Changing day to:", newDate);
      onDateChange(newDate);
    },
    [selectedDate, onDateChange]
  );

  const handleDateChange = useCallback(
    (newDate) => {
      const formattedDate = moment(newDate).format("YYYY-MM-DD");
      console.log("Date selected from calendar:", formattedDate);
      onDateChange(formattedDate);
      handleSetModalVisible(false);
    },
    [onDateChange, handleSetModalVisible]
  );

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="sticky top-0 z-10 mx-3 sm:mx-3">
        <div className="flex items-center justify-between bg-gray-50 rounded-full shadow-sm border-gray-200 px-2 py-2">
          <div className="flex items-center flex-grow space-x-4">
            <button
              onClick={() => handleChangeDay(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Previous day"
            >
              <FaChevronLeft size={16} className="text-gray-700" />
            </button>

            <button
              onClick={() => handleSetModalVisible(true)}
              className="flex-1 text-center px-2"
            >
              <span className="text-sm sm:text-base font-medium text-gray-800">
                {moment(selectedDate).format("MMM D, YYYY")}
              </span>
            </button>

            <button
              onClick={() => handleChangeDay(1)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Next day"
            >
              <FaChevronRight size={16} className="text-gray-700" />
            </button>
          </div>


          <motion.button
        className="p-2 rounded-full shadow-lg bg-gray-800 text-white z-50"
        onClick={() => {
           setVoiceAssistantVisible(!voiceAssistantVisible)}}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle voice assistant"
      >
        <FaMicrophone size={22} />
      </motion.button>


          <div className="flex items-center justify-end ml-2">
            <button
              onClick={() => handleSetTaskModalVisible(true)}
              className="bg-gray-800 text-white p-2 flex justify-center items-center rounded-full hover:bg-gray-700 transition relative"
              aria-label="Add task"
            >
              <FaPlus size={22} />
              {(newTaskCount > 0 || updatedTaskCount > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {newTaskCount + updatedTaskCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide px-2">
        <CustomTimeline
          tasks={filteredTasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          newTaskCount={newTaskCount}
          updatedTaskCount={updatedTaskCount}
        />
      </div>

       
      {modalVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-md">
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateCalendar
                value={moment(selectedDate)}
                onChange={handleDateChange}
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  "& .MuiPickersCalendarHeader-root": {
                    padding: "0px 12px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px 8px 0 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  },
                  "& .MuiPickersCalendarHeader-label": {
                    flexGrow: 1,
                    textAlign: "center",
                  },
                  "& .MuiPickersArrowSwitcher-root": {
                    flexShrink: 0,
                  },
                  "& .MuiDayCalendar-weekContainer": {
                    margin: "8px 0",
                  },
                  "& .MuiPickersDay-root": {
                    fontSize: "1rem",
                    "&:hover": {
                      backgroundColor: "#e8f0fe",
                    },
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#4f46e5 !important",
                    color: "#fff",
                  },
                  "& .MuiYearCalendar-root": {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
                    gap: "1px",
                    padding: "8px",
                    overflowX: "hidden",
                  },
                  "& .MuiPickersYear-yearButton": {
                    fontSize: "0.875rem",
                    padding: "8px",
                  },
                }}
              />
            </LocalizationProvider>
            <button
              onClick={() => handleSetModalVisible(false)}
              className="mt-4 w-full bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition"
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

       <VoiceAssistantSheet
        onSubmit={handleTaskSubmit}
        userId={user?.id}
        isOpen={voiceAssistantVisible}
        setIsOpen={setVoiceAssistantVisible}
      />
    </div>
  );
};

export default React.memo(TaskView);