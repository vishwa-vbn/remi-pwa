// src/components/common/NotificationSnackbarProvider.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationSnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [messageData, setMessageData] = useState({ message: '', severity: 'info' });

  const showNotification = useCallback((message, severity = 'info') => {
    setMessageData({ message, severity });
    setOpen(true);
  }, []);

  const handleClose = () => setOpen(false);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity={messageData.severity} sx={{ width: '100%' }} variant="filled">
          {messageData.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
