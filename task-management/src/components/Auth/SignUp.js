import { useState } from 'react';
import { Box, TextField, Button, RadioGroup, FormControlLabel, Radio, FormLabel, Alert, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import api from '../../utils/axios';

const validationSchema = yup.object({
  username: yup.string().required('Kullanıcı adı gereklidir'),
  email: yup.string().email('Geçerli bir email giriniz').required('Email gereklidir'),
  password: yup.string().required('Şifre gereklidir').min(6, 'Şifre en az 6 karakter olmalıdır'),
  userType: yup.string().required('Kullanıcı tipi seçiniz'),
  companyName: yup.string().when('userType', {
    is: 'corporate',
    then: yup.string().required('Şirket adı gereklidir'),
  }),
});

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userType, setUserType] = useState('individual');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      userType: 'individual',
      companyName: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        // Kullanıcı kaydı
        const registerResponse = await api.post('/auth/local/register', {
          username: values.username,
          email: values.email,
          password: values.password,
        });

        // Role ataması
        await api.put(`/users/${registerResponse.data.user.id}`, {
          role: values.userType === 'corporate' ? 2 : 3, // 2: Corporate, 3: Individual
        });

        if (values.userType === 'corporate' && values.companyName) {
          // Kurumsal kullanıcı için team oluştur
          await api.post('/teams', {
            data: {
              name: values.companyName,
              description: `${values.companyName} team`,
              leader: registerResponse.data.user.id
            }
          });
        }

        // Otomatik login
        dispatch(loginSuccess(registerResponse.data));
        navigate('/my-tasks');
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Kayıt işlemi başarısız oldu');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        fullWidth
        margin="normal"
        name="username"
        label="Kullanıcı Adı"
        value={formik.values.username}
        onChange={formik.handleChange}
        error={formik.touched.username && Boolean(formik.errors.username)}
        helperText={formik.touched.username && formik.errors.username}
        disabled={loading}
      />
      <TextField
        fullWidth
        margin="normal"
        name="email"
        label="Email"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        disabled={loading}
      />
      <TextField
        fullWidth
        margin="normal"
        name="password"
        label="Şifre"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        disabled={loading}
      />
      
      <FormLabel component="legend" sx={{ mt: 2 }}>Kullanıcı Tipi</FormLabel>
      <RadioGroup
        name="userType"
        value={userType}
        onChange={(e) => {
          setUserType(e.target.value);
          formik.setFieldValue('userType', e.target.value);
        }}
      >
        <FormControlLabel 
          value="individual" 
          control={<Radio disabled={loading} />} 
          label="Bireysel" 
        />
        <FormControlLabel 
          value="corporate" 
          control={<Radio disabled={loading} />} 
          label="Kurumsal" 
        />
      </RadioGroup>

      {userType === 'corporate' && (
        <TextField
          fullWidth
          margin="normal"
          name="companyName"
          label="Şirket Adı"
          value={formik.values.companyName}
          onChange={formik.handleChange}
          error={formik.touched.companyName && Boolean(formik.errors.companyName)}
          helperText={formik.touched.companyName && formik.errors.companyName}
          disabled={loading}
        />
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Kayıt Ol'}
      </Button>
    </Box>
  );
};

export default SignUp;