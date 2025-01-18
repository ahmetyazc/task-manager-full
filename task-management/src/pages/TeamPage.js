import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useSelector } from 'react-redux';
import CreateTeam from '../components/Team/CreateTeam';
import ManageTeam from '../components/Team/ManageTeam';
import api from '../utils/axios';

const TeamPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await api.get('/users/me', {
          params: {
            populate: ['role']
          }
        });
        setUserRole(response.data.role);
      } catch (err) {
        setError('Kullanıcı rolü yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserRole();
    }
  }, [user?.id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Sadece kurumsal kullanıcılar ve adminler takım oluşturabilir
  const canCreateTeam = userRole?.type === 'corporate' || userRole?.type === 'admin';

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          mb: 3
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.main 
          }}
        >
          Takım Yönetimi
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          onClose={clearError}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      <Paper 
        sx={{ 
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }}
        elevation={2}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              minHeight: 48,
            }
          }}
        >
          {canCreateTeam && <Tab label="Takım Oluştur" />}
          <Tab label="Takımları Yönet" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && canCreateTeam ? (
          <CreateTeam onError={handleError} onSuccess={clearError} />
        ) : (
          <ManageTeam onError={handleError} onSuccess={clearError} />
        )}
      </Box>
    </Box>
  );
};

export default TeamPage;