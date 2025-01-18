import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Typography,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import Login from '../components/Auth/Login';
import SignUp from '../components/Auth/SignUp';

const AuthPage = () => {
  const [value, setValue] = useState(0);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Kullanıcı zaten giriş yapmışsa my-tasks sayfasına yönlendir
  if (isAuthenticated) {
    return <Navigate to="/my-tasks" />;
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Box 
        sx={{ 
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          mb: 4
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.main 
          }}
        >
          Task Management
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Projelerinizi ve görevlerinizi kolayca yönetin
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          width: '100%', 
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Tabs 
          value={value} 
          onChange={(e, v) => setValue(v)} 
          centered
          sx={{
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'medium',
              fontSize: '1rem',
              minWidth: isMobile ? 'auto' : 120,
            }
          }}
        >
          <Tab label="Giriş Yap" />
          <Tab label="Kayıt Ol" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {value === 0 ? <Login /> : <SignUp />}
        </Box>
      </Paper>

      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ mt: 4, textAlign: 'center' }}
      >
        © {new Date().getFullYear()} Task Management. Tüm hakları saklıdır.
      </Typography>
    </Box>
  );
};

export default AuthPage;