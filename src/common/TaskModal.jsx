import React, { useState, useEffect, useCallback } from "react";
import { IoClose, IoCheckmarkCircle } from "react-icons/io5";
import moment from "moment";
import {
  Box,
  Modal,
  Typography,
  TextField,
  Switch,
  Button,
  IconButton,
  TextareaAutosize,
  FormControlLabel,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { motion, AnimatePresence } from "framer-motion";

const TaskSheet = ({ visible, onClose, onSubmit, initialData, userId }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [alertOn, setAlertOn] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [alertMinutes, setAlertMinutes] = useState(5);

  useEffect(() => {
    if (initialData) {
      const initialTimestamp = initialData.timestamp
        ? new Date(initialData.timestamp)
        : new Date();
      setTaskTitle(initialData.title || "");
      setDate(initialTimestamp);
      setTime(initialTimestamp);
      setAlertOn(!!initialData.alertMinutes);
      setDescription(initialData.description || "");
      setNote(initialData.note || "");
      setAlertMinutes(initialData.alertMinutes || 5);
      setIsCompleted(initialData.status || false);
    } else {
      const now = new Date();
      setTaskTitle("");
      setDate(now);
      setTime(now);
      setAlertOn(false);
      setDescription("");
      setNote("");
      setAlertMinutes(5);
      setIsCompleted(false);
    }
  }, [initialData, visible]);

  const handleSubmit = useCallback(() => {
    if (!taskTitle.trim()) {
      alert("Task title is required.");
      return;
    }

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
  }, [
    taskTitle,
    date,
    time,
    description,
    note,
    alertOn,
    alertMinutes,
    isCompleted,
    userId,
    onSubmit,
    onClose,
  ]);

  // Framer Motion variants for the bottom sheet animation
  const sheetVariants = {
    hidden: {
      y: "100%",
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <Modal
      open={visible}
      onClose={onClose}
      sx={{ display: "flex", justifyContent: "center", alignItems: "flex-end" }}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              width: "100%",
              maxWidth: "600px", // Optional: limit max width for better UX
            }}
          >
            <Box
              sx={{
                width: "100%",
                bgcolor: "background.paper",
                borderRadius: "16px 16px 0 0",
                border: "1px solid",
                borderColor: "grey.200",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Fixed Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "grey.300",
                  borderTopLeftRadius: "20px",
                  borderTopRightRadius: "20px",
                  position: "sticky",
                  top: 0,
                  bgcolor: "background.paper",
                  zIndex: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {initialData ? "Edit Task" : "New Task"}
                </Typography>
                <IconButton onClick={onClose}>
                  <IoClose size={24} />
                </IconButton>
              </Box>

              {/* Scrollable Form Fields */}
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    overflowY: "auto",
                    flex: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Task Title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    variant="outlined"
                  />

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <DatePicker
                      label="Date"
                      value={moment(date)}
                      onChange={(newDate) => setDate(newDate.toDate())}
                      sx={{ flex: 1 }}
                    />
                    <TimePicker
                      label="Time"
                      value={moment(time)}
                      onChange={(newTime) => setTime(newTime.toDate())}
                      sx={{ flex: 1 }}
                      minutesStep={15}
                    />
                  </Box>

                  <TextareaAutosize
                    minRows={4}
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid rgba(0, 0, 0, 0.23)",
                      borderRadius: "4px",
                      resize: "none",
                      fontFamily: "inherit",
                      fontSize: "1rem",
                    }}
                  />

                  <TextareaAutosize
                    minRows={4}
                    placeholder="Note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid rgba(0, 0, 0, 0.23)",
                      borderRadius: "4px",
                      resize: "none",
                      fontFamily: "inherit",
                      fontSize: "1rem",
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={alertOn}
                        onChange={() => setAlertOn(!alertOn)}
                        color="primary"
                      />
                    }
                    label="Enable Alert"
                  />

                  {alertOn && (
                    <Box sx={{ pl: 0 }}>
                      <Typography variant="body2">Alert before:</Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        {[2, 5, 10, 15].map((minutes) => (
                          <Button
                            key={minutes}
                            variant={
                              alertMinutes === minutes ? "contained" : "outlined"
                            }
                            onClick={() => setAlertMinutes(minutes)}
                            size="small"
                          >
                            {minutes} min
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {initialData && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isCompleted}
                          onChange={() => setIsCompleted(!isCompleted)}
                          color="primary"
                        />
                      }
                      label="Mark as Completed"
                    />
                  )}
                </Box>
              </LocalizationProvider>

              {/* Fixed Save Button */}
              <Box
                sx={{
                  p: 1,
                  borderTop: "1px solid",
                  borderColor: "grey.200",
                  position: "sticky",
                  bottom: 0,
                  bgcolor: "background.paper",
                  zIndex: 1,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleSubmit}
                  startIcon={<IoCheckmarkCircle size={20} />}
                >
                  {initialData ? "Update Task" : "Save Task"}
                </Button>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default TaskSheet;