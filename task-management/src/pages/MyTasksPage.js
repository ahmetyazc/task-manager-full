import { useState, useEffect } from 'react';
import { Grid, CircularProgress, Alert, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import TaskCard from '../components/Task/TaskCard';
import api from '../utils/axios';

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
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
            populate: ['team', 'work_packages', 'notifications']
          }
        });

        // Strapi response'unu uygun formata dönüştür
        const formattedTasks = response.data.data.map(task => ({
          id: task.id,
          title: task.attributes.title,
          description: task.attributes.description,
          progress: task.attributes.progress,
          deadline: task.attributes.deadline,
          status: task.attributes.taskStatus,
          team: task.attributes.team?.data,
          workPackages: task.attributes.work_packages?.data,
          notifications: task.attributes.notifications?.data?.map(n => n.attributes.message) || []
        }));

        setTasks(formattedTasks);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Görevler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {tasks.map((task) => (
        <Grid item xs={12} sm={6} md={4} key={task.id}>
          <TaskCard task={task} />
        </Grid>
      ))}
    </Grid>
  );
};

export default MyTasksPage;