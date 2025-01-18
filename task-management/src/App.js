import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';

// Components
import Layout from './components/Layout/Layout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import MyTasksPage from './pages/MyTasksPage';
import CreateTaskPage from './pages/CreateTaskPage';
import ManageTaskPage from './pages/ManageTaskPage';
import TeamPage from './pages/TeamPage';
import NotificationsPage from './pages/NotificationsPage';
import LoadingScreen from './components/UI/LoadingScreen';
import CustomSnackbar from './components/UI/CustomSnackbar';
import ConfirmDialog from './components/UI/ConfirmDialog';

// Theme
import { lightTheme, darkTheme } from './theme';

// Store
import { selectAuth } from './store/slices/authSlice';
import { selectDarkMode, selectSnackbar, selectDialog } from './store/slices/uiSlice';
import { fetchNotifications } from './store/slices/notificationSlice';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(selectAuth);
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector(selectDarkMode);
  const snackbar = useSelector(selectSnackbar);
  const dialog = useSelector(selectDialog);
  const { isAuthenticated } = useSelector(selectAuth);

  // Bildirim polling
  useEffect(() => {
    let interval;
    if (isAuthenticated) {
      // İlk yükleme
      dispatch(fetchNotifications());
      
      // Her 30 saniyede bir güncelle
      interval = setInterval(() => {
        dispatch(fetchNotifications());
      }, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dispatch, isAuthenticated]);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      
      <Routes>
        <Route path="/auth" element={
          isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="my-tasks" element={<MyTasksPage />} />
          <Route path="create-task" element={<CreateTaskPage />} />
          <Route path="manage-task/:taskId" element={<ManageTaskPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Components */}
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
      />

      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        content={dialog.content}
        confirmLabel={dialog.confirmLabel}
        cancelLabel={dialog.cancelLabel}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />
    </ThemeProvider>
  );
};

export default App;