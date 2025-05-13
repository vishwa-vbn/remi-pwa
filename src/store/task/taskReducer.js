// import { ADD_TASK, UPDATE_TASK, SET_TASKS } from "./taskAction";

// const initialState = {
//   tasks: {},
// };

// const taskReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case ADD_TASK:
//     case UPDATE_TASK:
//       return {
//         ...state,
//         tasks: {
//           ...state.tasks,
//           [action.payload.id]: action.payload,
//         },
//       };
//     case "SET_TASKS":
//       return {
//         ...state,
//         tasks: action.payload.length ? action.payload : state.tasks, // Preserve state if no new tasks
//       };

//     default:
//       return state;
//   }
// };

// export default taskReducer;


import {
  ADD_TASK,
  UPDATE_TASK,
  SET_TASKS,
  SET_NEW_TASK_COUNT,
  SET_UPDATED_TASK_COUNT,
} from "./taskAction";

const initialState = {
  tasks: [],
  newTaskCount: 0,
  updatedTaskCount: 0,
};

const taskReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TASK: {
      const newTask = { ...action.payload };
      return {
        ...state,
        tasks: [...state.tasks.filter((t) => t.id !== newTask.id), newTask],
      };
    }
    case UPDATE_TASK: {
      const updatedTask = { ...action.payload };
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        ),
      };
    }
    case SET_TASKS: {
      return {
        ...state,
        tasks: action.payload.map((task) => ({
          ...task,
          isNew: false,
          isUpdated: false,
        })),
        newTaskCount: 0,
        updatedTaskCount: 0,
      };
    }
    case SET_NEW_TASK_COUNT:
      return {
        ...state,
        newTaskCount: action.payload,
      };
    case SET_UPDATED_TASK_COUNT:
      return {
        ...state,
        updatedTaskCount: action.payload,
      };
    default:
      return state;
  }
};

export default taskReducer;


