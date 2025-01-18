import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Paper,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CreateTaskForm from '../components/Task/CreateTaskForm';
import api from '../utils/axios';

const steps = ['Görev Detayları', 'İş Paketleri', 'Takım Ataması'];

const CreateTaskPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (values) => {
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
      if (values.workPackages?.length > 0) {
        await Promise.all(values.workPackages.map(wp => 
          api.post('/work-packages', {
            data: {
              name: wp.name,
              percentage: wp.percentage,
              deadline: wp.deadline,
              status: 'pending',
              task: taskId
            }
          })
        ));
      }

      // Bildirim oluştur
      await api.post('/notifications', {
        data: {
          title: 'Yeni Görev',
          message: `${values.title} görevi oluşturuldu`,
          type: 'task_created',
          read: false,
          user: user.id
        }
      });

      // Başarılı oluşturma sonrası yönlendirme
      navigate('/my-tasks', { 
        state: { 
          success: true, 
          message: 'Görev başarıyla oluşturuldu' 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Görev oluşturulurken bir hata oluştu');
    }
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  return (
    <Box>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          mb: 4
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          Yeni Görev Oluştur
        </Typography>

        <Stepper 
          activeStep={activeStep} 
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{ mb: 4 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        <CreateTaskForm 
          onSubmit={handleSubmit}
          activeStep={activeStep}
          onStepChange={handleStepChange}
          totalSteps={steps.length}
        />
      </Paper>
    </Box>
  );
};

export default CreateTaskPage;