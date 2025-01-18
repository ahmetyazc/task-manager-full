import { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Paper, Typography, Chip, Grid, IconButton,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const validationSchema = yup.object({
  title: yup.string().required('Başlık gereklidir'),
  description: yup.string().required('Açıklama gereklidir'),
  deadline: yup.date().required('Deadline gereklidir'),
  team: yup.number().required('Takım seçimi gereklidir'),
});

const CreateTaskForm = () => {
  const [workPackages, setWorkPackages] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Takımları yükle
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get('/teams', {
          params: {
            populate: ['members', 'leader']
          }
        });
        setTeams(response.data.data);
      } catch (err) {
        setError('Takımlar yüklenirken hata oluştu');
      }
    };
    fetchTeams();
  }, []);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      deadline: '',
      team: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        // Ana görevi oluştur
        const taskResponse = await api.post('/project-tasks', {
          data: {
            title: values.title,
            description: values.description,
            deadline: values.deadline,
            progress: 0,
            taskStatus: 'pending',
            team: values.team,
            owner: user.id
          }
        });

        const taskId = taskResponse.data.data.id;

        // İş paketlerini oluştur
        for (const wp of workPackages) {
          await api.post('/work-packages', {
            data: {
              name: wp.name,
              percentage: parseFloat(wp.percentage),
              deadline: wp.deadline,
              packageStatus: 'pending',
              project_task: taskId
            }
          });
        }

        // Bildirim oluştur
        await api.post('/notifications', {
          data: {
            title: 'Yeni Görev',
            message: `${values.title} görevi oluşturuldu`,
            type: 'task',
            read: false,
            user: user.id
          }
        });

        navigate('/my-tasks');
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Görev oluşturulurken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleAddWorkPackage = () => {
    setWorkPackages([
      ...workPackages,
      { name: '', percentage: 0, deadline: '' },
    ]);
  };

  const handleWorkPackageChange = (index, field, value) => {
    const newWorkPackages = [...workPackages];
    newWorkPackages[index][field] = value;
    setWorkPackages(newWorkPackages);
  };

  const handleRemoveWorkPackage = (index) => {
    setWorkPackages(workPackages.filter((_, i) => i !== index));
  };

  return (
    <Paper sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="title"
              label="Görev Başlığı"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="description"
              label="Görev Açıklaması"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              name="deadline"
              label="Deadline"
              InputLabelProps={{ shrink: true }}
              value={formik.values.deadline}
              onChange={formik.handleChange}
              error={formik.touched.deadline && Boolean(formik.errors.deadline)}
              helperText={formik.touched.deadline && formik.errors.deadline}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Takım</InputLabel>
              <Select
                name="team"
                value={formik.values.team}
                onChange={formik.handleChange}
                error={formik.touched.team && Boolean(formik.errors.team)}
                disabled={loading}
              >
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.attributes.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              İş Paketleri
            </Typography>
            {workPackages.map((wp, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="İş Paketi Adı"
                      value={wp.name}
                      onChange={(e) => handleWorkPackageChange(index, 'name', e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Yüzde (%)"
                      value={wp.percentage}
                      onChange={(e) => handleWorkPackageChange(index, 'percentage', e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Deadline"
                      InputLabelProps={{ shrink: true }}
                      value={wp.deadline}
                      onChange={(e) => handleWorkPackageChange(index, 'deadline', e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton 
                      onClick={() => handleRemoveWorkPackage(index)} 
                      color="error"
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddWorkPackage}
              variant="outlined"
              sx={{ mt: 1 }}
              disabled={loading}
            >
              İş Paketi Ekle
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Görevi Oluştur'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CreateTaskForm;