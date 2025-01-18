import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import CreateTaskForm from '../components/Task/CreateTaskForm';
import api from '../utils/axios';

const ManageTaskPage = () => {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/project-tasks', {
        params: {
          filters: {
            owner: {
              id: {
                $eq: user.id
              }
            }
          },
          populate: ['team', 'work_packages']
        }
      });
      setTasks(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Görevler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user.id]);

  const handleEdit = (task) => {
    setSelectedTask(task);
    setOpenEditDialog(true);
  };

  const handleDelete = (task) => {
    setSelectedTask(task);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/project-tasks/${selectedTask.id}`);
      
      // Bildirim oluştur
      await api.post('/notifications', {
        data: {
          title: 'Görev Silindi',
          message: `${selectedTask.attributes.title} görevi silindi`,
          type: 'task_deleted',
          read: false,
          user: user.id
        }
      });

      setOpenDeleteDialog(false);
      fetchTasks(); // Listeyi yenile
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Görev silinirken bir hata oluştu');
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      await api.put(`/project-tasks/${selectedTask.id}`, {
        data: values
      });
      
      // Bildirim oluştur
      await api.post('/notifications', {
        data: {
          title: 'Görev Güncellendi',
          message: `${values.title} görevi güncellendi`,
          type: 'task_updated',
          read: false,
          user: user.id
        }
      });

      setOpenEditDialog(false);
      fetchTasks(); // Listeyi yenile
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Görev güncellenirken bir hata oluştu');
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
      <Typography variant="h4" gutterBottom>
        Görev Yönetimi
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {task.attributes.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {task.attributes.description}
                </Typography>
                
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    İlerleme: {task.attributes.progress}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={task.attributes.progress} 
                    sx={{ mb: 1 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={task.attributes.taskStatus} 
                    size="small"
                    color={
                      task.attributes.taskStatus === 'completed' ? 'success' :
                      task.attributes.taskStatus === 'inprogress' ? 'warning' : 'default'
                    }
                  />
                  {task.attributes.team?.data && (
                    <Chip 
                      label={task.attributes.team.data.attributes.name}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(task)}
                >
                  Düzenle
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(task)}
                >
                  Sil
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Görevi Düzenle</DialogTitle>
        <DialogContent>
          <CreateTaskForm
            initialValues={selectedTask?.attributes}
            onSubmit={handleEditSubmit}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Görevi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>İptal</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageTaskPage;