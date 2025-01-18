import { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Button,
  Avatar,
  Typography,
  Badge,
  Divider
} from '@mui/material';
import {
  Task,
  AddTask,
  Settings,
  Group,
  Notifications,
  ExitToApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import api from '../../utils/axios';

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [notificationCount, setNotificationCount] = useState(0);

  const menuItems = [
    { text: 'Görevlerim', icon: <Task />, path: '/my-tasks' },
    { text: 'Görev Oluştur', icon: <AddTask />, path: '/create-task' },
    { text: 'Görev Yönetimi', icon: <Settings />, path: '/manage-task' },
    { text: 'Takım Yönetimi', icon: <Group />, path: '/team' },
    { 
      text: 'Bildirimler', 
      icon: (
        <Badge badgeContent={notificationCount} color="error">
          <Notifications />
        </Badge>
      ), 
      path: '/notifications' 
    },
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications', {
          params: {
            filters: {
              user: {
                id: {
                  $eq: user.id
                }
              },
              read: {
                $eq: false
              }
            }
          }
        });
        setNotificationCount(response.data.data.length);
      } catch (error) {
        console.error('Bildirimler yüklenirken hata oluştu:', error);
      }
    };

    if (user?.id) {
      fetchNotifications();
      // Her 30 saniyede bir bildirimleri kontrol et
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Box sx={{ 
        overflow: 'auto', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {/* User Profile Section */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              mb: 1,
              bgcolor: 'primary.main'
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>

        <Divider />

        {/* Menu Items */}
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => navigate(item.path)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>

        {/* Logout Button */}
        <Box sx={{ marginTop: 'auto', p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            sx={{
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'error.dark',
              }
            }}
          >
            Çıkış Yap
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;