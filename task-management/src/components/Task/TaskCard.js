import { Card, CardContent, Typography, LinearProgress, Box, Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const TaskCard = ({ task }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/manage-task/${task.id}`);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'inprogress':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" gutterBottom>
            {task.title}
          </Typography>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>Düzenle</MenuItem>
          </Menu>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {task.description}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            İlerleme: {task.progress}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={task.progress} 
            color={getStatusColor(task.status)}
          />
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Chip 
            label={task.status === 'inprogress' ? 'Devam Ediyor' : 
                  task.status === 'completed' ? 'Tamamlandı' : 'Beklemede'} 
            color={getStatusColor(task.status)}
            size="small"
          />
          {task.team && (
            <Chip 
              label={task.team.attributes.name}
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Deadline: {format(new Date(task.deadline), 'dd MMMM yyyy', { locale: tr })}
        </Typography>

        {task.notifications?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Son Bildirimler:
            </Typography>
            {task.notifications.slice(0, 2).map((notification, index) => (
              <Chip
                key={index}
                label={notification}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;