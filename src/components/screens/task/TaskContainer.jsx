import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import {
  addTask,
  updateTask,
  subscribeToTasks,
  unsubscribeFromTasks,
  deleteTask,
} from '../../../store/task/taskAction';
import TaskView from './TaskView';

const TaskContainer = ({
  tasks,
  user,
  addTask,
  updateTask,
  subscribeToTasks,
  unsubscribeFromTasks,
  deleteTask,
  newTaskCount,
  updatedTaskCount,
}) => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [modalVisible, setModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  useEffect(() => {
    let unsubscribeFn = () => {}; // Default empty function

    const subscribe = async () => {
      try {
        // Await the promise to get the actual unsubscribe function
        unsubscribeFn = await subscribeToTasks();
      } catch (error) {
        console.error('Error subscribing to tasks:', error);
      }
    };

    subscribe();

    return () => {
      unsubscribeFn(); // Call the actual unsubscribe function
      unsubscribeFromTasks();
    };
  }, [subscribeToTasks, unsubscribeFromTasks]);

  const onDateChange = useCallback((date) => {
    setSelectedDate(moment(date).format('YYYY-MM-DD'));
    setModalVisible(false);
  }, []);

  const changeDay = useCallback((days) => {
    setSelectedDate((prev) => moment(prev).add(days, 'days').format('YYYY-MM-DD'));
  }, []);

  const handleTaskSubmit = useCallback(
    async (taskData) => {
      if (currentTask?.id) {
        await updateTask(currentTask.id, taskData);
      } else {
        await addTask(taskData);
      }
      setTaskModalVisible(false);
      setCurrentTask(null);
    },
    [addTask, updateTask, currentTask]
  );

  const handleEditTask = useCallback((task) => {
    setCurrentTask(task);
    setTaskModalVisible(true);
  }, []);

  const handleDeleteTask = useCallback(
    (taskId) => {
      deleteTask(taskId);
    },
    [deleteTask]
  );

  return (
    <TaskView
      selectedDate={selectedDate}
      modalVisible={modalVisible}
      taskModalVisible={taskModalVisible}
      currentTask={currentTask}
      onDateChange={onDateChange}
      changeDay={changeDay}
      setModalVisible={setModalVisible}
      setTaskModalVisible={setTaskModalVisible}
      handleTaskSubmit={handleTaskSubmit}
      handleEditTask={handleEditTask}
      handleDeleteTask={handleDeleteTask}
      tasks={tasks.tasks}
      user={user}
      newTaskCount={newTaskCount}
      updatedTaskCount={updatedTaskCount}
    />
  );
};

const mapStateToProps = (state) => ({
  tasks: state.task,
  user: state.auth.user,
  newTaskCount: state.task.newTaskCount,
  updatedTaskCount: state.task.updatedTaskCount,
});

const mapDispatchToProps = {
  addTask,
  updateTask,
  subscribeToTasks,
  unsubscribeFromTasks,
  deleteTask,
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskContainer);