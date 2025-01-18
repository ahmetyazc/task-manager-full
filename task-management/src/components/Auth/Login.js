import { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import api from '../../utils/axios';

const validationSchema = yup.object({
  email: yup.string()
    .email('Geçerli bir email giriniz')
    .required('Email gereklidir'),
  password: yup.string()
    .required('Şifre gereklidir')
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        dispatch(loginStart());
        setLoading(true);

        const response = await api.post('/auth/local', {
          identifier: values.email,
          password: values.password,
        });

        // Kullanıcı rolünü kontrol et
        const userResponse = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${response.data.jwt}`
          }
        });

        const userData = {
          ...response.data,
          user: {
            ...response.data.user,
            role: userResponse.data.role
          }
        };

        dispatch(loginSuccess(userData));
        navigate('/my-tasks');
      } catch (err) {
        const errorMessage = err.response?.data?.error?.message || 'Giriş başarısız';
        dispatch(loginFailure(errorMessage));
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
      {formik.errors.submit && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formik.errors.submit}
        </Alert>
      )}
      <TextField
        fullWidth
        margin="normal"
        name="email"
        label="Email"
        autoComplete="email"
        autoFocus
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        disabled={loading}
        InputProps={{
          sx: {
            '&.Mui-focused': {
              borderColor: 'primary.main',
            },
          },
        }}
      />
      <TextField
        fullWidth
        margin="normal"
        name="password"
        label="Şifre"
        type="password"
        autoComplete="current-password"
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        disabled={loading}
        InputProps={{
          sx: {
            '&.Mui-focused': {
              borderColor: 'primary.main',
            },
          },
        }}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{
          mt: 3,
          mb: 2,
          py: 1.5,
          position: 'relative',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        ) : (
          'Giriş Yap'
        )}
      </Button>
    </Box>
  );
};

export default Login;