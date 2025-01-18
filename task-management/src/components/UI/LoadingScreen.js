import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = ({ message = 'Yükleniyor...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <CircularProgress size={60} />
      <Typography
        variant="h6"
        sx={{ mt: 2, color: 'text.secondary' }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;