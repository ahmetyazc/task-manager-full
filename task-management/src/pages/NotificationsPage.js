import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
  Group as TeamIcon,
  CheckCircle as ReadIcon,
  RadioButtonUnchecked as UnreadIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import api from '../utils/axios';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications', {
        params: {
          filters: {
            user: {
              id: {
                $eq: user.id
              }
            }
          },
          sort: ['createdAt:desc']
        }
      });
      setNotifications(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Bildirimler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user.id]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      fetchNotifications();
    } catch (err) {
      setError('Bildirim silinirken bir hata oluştu');
    }
  };

  const handleMarkAsRead = async (notification) => {
    try {
      await api.put(`/notifications/${notification.id}`, {
        data: {
          read: true
        }
      });
      fetchNotifications();
    } catch (err) {
      setError('Bildirim durumu güncellenirken bir hata oluştu');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.attributes.read);
      await Promise.all(
        unreadNotifications.map(notification =>
          api.put(`/notifications/${notification.id}`, {
            data: { read: true }
          })
        )
      );
      fetchNotifications();
    } catch (err) {
      setError('Bildirimler güncellenirken bir hata oluştu');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_created':
      case 'task_updated':
      case 'task_deleted':
        return <TaskIcon color="primary" />;
      case 'team_update':
        return <TeamIcon color="info" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Bildirimler
        </Typography>
        <Button
          variant="outlined"
          onClick={handleMarkAllAsRead}
          disabled={!notifications.some(n => !n.attributes.read)}
        >
          Tümünü Okundu İşaretle
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2}>
        <List>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="Bildirim Yok"
                secondary="Henüz hiç bildiriminiz bulunmuyor."
              />
            </ListItem>
          ) : (
            notifications.map((notification, index) => (
              <Box key={notification.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    bgcolor: notification.attributes.read ? 'transparent' : 'action.hover',
                  }}
                  secondaryAction={
                    <Box>
                      <Tooltip title={notification.attributes.read ? "Okundu" : "Okunmadı"}>
                        <IconButton
                          edge="end"
                          onClick={() => handleMarkAsRead(notification)}
                          sx={{ mr: 1 }}
                        >
                          {notification.attributes.read ? <ReadIcon color="success" /> : <UnreadIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Badge
                      color="error"
                      variant="dot"
                      invisible={notification.attributes.read}
                    >
                      {getNotificationIcon(notification.attributes.type)}
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.attributes.title}
                    secondary={
                      <>
                        {notification.attributes.message}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(notification.attributes.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </Box>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationsPage;