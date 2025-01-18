import { Box, Button, Typography, Container, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon 
} from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const features = [
    {
      icon: <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Görev Yönetimi',
      description: 'Projelerinizi ve görevlerinizi kolayca oluşturun, takip edin ve yönetin.'
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Takım Çalışması',
      description: 'Takım üyeleriyle gerçek zamanlı iş birliği yapın ve iletişim kurun.'
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'İlerleme Takibi',
      description: 'Projelerin ve görevlerin ilerlemesini anlık olarak izleyin ve raporlayın.'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      pt: 8,
      pb: 6 
    }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            mb: 8
          }}
        >
          <Typography
            component="h1"
            variant="h2"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}
          >
            Görev Yönetim Sistemi
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600 }}
          >
            Projelerinizi ve ekip çalışmalarınızı verimli bir şekilde yönetmek için modern çözüm
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(isAuthenticated ? '/my-tasks' : '/auth')}
            sx={{
              minWidth: 200,
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontSize: '1.1rem',
              textTransform: 'none',
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
              }
            }}
          >
            {isAuthenticated ? 'Görevlerime Git' : 'Giriş Yap / Kayıt Ol'}
          </Button>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                {feature.icon}
                <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Task Management. Tüm hakları saklıdır.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;