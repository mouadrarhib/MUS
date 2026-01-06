import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

/**
 * NotificationProvider - Provides notification context to the app
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(
    (message, variant = 'info', options = {}) => {
      const id = Date.now() + Math.random();
      const notification = {
        id,
        message,
        variant,
        ...options,
      };

      setNotifications((prev) => [...prev, notification]);

      // Auto remove after duration
      const duration = options.autoHideDuration ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const showSuccess = useCallback(
    (message, options = {}) => {
      return showNotification(message, 'success', options);
    },
    [showNotification]
  );

  const showError = useCallback(
    (message, options = {}) => {
      return showNotification(message, 'error', options);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message, options = {}) => {
      return showNotification(message, 'warning', options);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message, options = {}) => {
      return showNotification(message, 'info', options);
    },
    [showNotification]
  );

  const closeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHideDuration ?? 4000}
          onClose={() => closeNotification(notification.id)}
          anchorOrigin={{
            vertical: notification.vertical ?? 'top',
            horizontal: notification.horizontal ?? 'right',
          }}
          sx={{
            '& .MuiSnackbarContent-root': {
              borderRadius: 2,
            },
          }}
        >
          <Alert
            onClose={() => closeNotification(notification.id)}
            severity={notification.variant}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};
