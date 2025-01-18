import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Autocomplete,
  Avatar,
  Tooltip
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import api from '../../utils/axios';

const validationSchema = yup.object({
  name: yup.string().required('Takım adı gereklidir'),
  description: yup.string().required('Açıklama gereklidir'),
});

const CreateTeam = ({ onSuccess, onError }) => {
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users', {
          params: {
            filters: {
              id: {
                $ne: user.id
              }
            }
          }
        });
        setAvailableUsers(response.data);
      } catch (err) {
        onError?.('Kullanıcılar yüklenirken bir hata oluştu');
      }
    };

    fetchUsers();
  }, [user.id, onError]);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // Takım oluştur
        const teamResponse = await api.post('/teams', {
          data: {
            name: values.name,
            description: values.description,
            leader: user.id,
            members: members.map(member => member.id)
          }
        });

        // Bildirim oluştur
        await Promise.all([
          // Takım lideri için bildirim
          api.post('/notifications', {
            data: {
              title: 'Yeni Takım',
              message: `${values.name} takımı oluşturuldu`,
              type: 'team_created',
              read: false,
              user: user.id
            }
          }),
          // Takım üyeleri için bildirimler
          ...members.map(member =>
            api.post('/notifications', {
              data: {
                title: 'Takıma Davet',
                message: `${values.name} takımına davet edildiniz`,
                type: 'team_invitation',
                read: false,
                user: member.id
              }
            })
          )
        ]);

        onSuccess?.('Takım başarıyla oluşturuldu');
        formik.resetForm();
        setMembers([]);
      } catch (err) {
        onError?.(err.response?.data?.error?.message || 'Takım oluşturulurken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleAddMember = () => {
    if (selectedUser && !members.find(m => m.id === selectedUser.id)) {
      setMembers([...members, selectedUser]);
      setSelectedUser(null);
    }
  };

  const handleRemoveMember = (memberId) => {
    setMembers(members.filter(member => member.id !== memberId));
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={2}>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="name"
              label="Takım Adı"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="description"
              label="Takım Açıklaması"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Takım Üyeleri
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={9}>
                  <Autocomplete
                    fullWidth
                    options={availableUsers.filter(user => 
                      !members.find(m => m.id === user.id)
                    )}
                    getOptionLabel={(option) => `${option.username} (${option.email})`}
                    value={selectedUser}
                    onChange={(event, newValue) => {
                      setSelectedUser(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Üye Seç"
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddMember}
                    disabled={!selectedUser || loading}
                    sx={{ height: '100%' }}
                  >
                    Ekle
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {members.map((member) => (
                <Tooltip key={member.id} title={member.email}>
                  <Chip
                    avatar={
                      <Avatar>
                        {member.username.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    label={member.username}
                    onDelete={() => handleRemoveMember(member.id)}
                    disabled={loading}
                  />
                </Tooltip>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                position: 'relative'
              }}
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
                'Takım Oluştur'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CreateTeam;