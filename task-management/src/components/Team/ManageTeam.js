import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  CircularProgress,
  Alert,
  Autocomplete,
  Tooltip,
  DialogContentText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../../utils/axios';

const ManageTeam = ({ onError, onSuccess }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams', {
        params: {
          populate: ['members', 'leader']
        }
      });
      setTeams(response.data.data);
    } catch (err) {
      onError?.(err.response?.data?.error?.message || 'Takımlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/users');
      setAvailableUsers(response.data);
    } catch (err) {
      onError?.('Kullanıcılar yüklenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchAvailableUsers();
  }, []);

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setOpenDialog(true);
  };

  const handleDeleteTeam = (team) => {
    setSelectedTeam(team);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteTeam = async () => {
    try {
      await api.delete(`/teams/${selectedTeam.id}`);
      
      // Bildirim oluştur
      await api.post('/notifications', {
        data: {
          title: 'Takım Silindi',
          message: `${selectedTeam.attributes.name} takımı silindi`,
          type: 'team_deleted',
          read: false,
          user: user.id
        }
      });

      onSuccess?.('Takım başarıyla silindi');
      setOpenDeleteDialog(false);
      fetchTeams();
    } catch (err) {
      onError?.(err.response?.data?.error?.message || 'Takım silinirken bir hata oluştu');
    }
  };

  const handleAddMember = async () => {
    if (selectedUser && selectedTeam) {
      try {
        const currentMembers = selectedTeam.attributes.members.data || [];
        await api.put(`/teams/${selectedTeam.id}`, {
          data: {
            members: [...currentMembers.map(m => m.id), selectedUser.id]
          }
        });

        // Bildirim oluştur
        await api.post('/notifications', {
          data: {
            title: 'Takıma Eklendi',
            message: `${selectedTeam.attributes.name} takımına eklendiniz`,
            type: 'team_member_added',
            read: false,
            user: selectedUser.id
          }
        });

        setSelectedUser(null);
        setOpenDialog(false);
        fetchTeams();
        onSuccess?.('Üye başarıyla eklendi');
      } catch (err) {
        onError?.(err.response?.data?.error?.message || 'Üye eklenirken bir hata oluştu');
      }
    }
  };

  const handleRemoveMember = async (teamId, memberId) => {
    try {
      const team = teams.find(t => t.id === teamId);
      const currentMembers = team.attributes.members.data || [];
      
      await api.put(`/teams/${teamId}`, {
        data: {
          members: currentMembers.filter(m => m.id !== memberId).map(m => m.id)
        }
      });

      // Bildirim oluştur
      await api.post('/notifications', {
        data: {
          title: 'Takımdan Çıkarıldı',
          message: `${team.attributes.name} takımından çıkarıldınız`,
          type: 'team_member_removed',
          read: false,
          user: memberId
        }
      });

      fetchTeams();
      onSuccess?.('Üye başarıyla çıkarıldı');
    } catch (err) {
      onError?.(err.response?.data?.error?.message || 'Üye çıkarılırken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} key={team.id}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {team.attributes.name}
                  </Typography>
                  <Box>
                    <IconButton 
                      onClick={() => handleEditTeam(team)}
                      disabled={team.attributes.leader.data?.id !== user.id}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteTeam(team)}
                      disabled={team.attributes.leader.data?.id !== user.id}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {team.attributes.description}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    Takım Lideri:
                  </Typography>
                  <Chip
                    avatar={<Avatar>{team.attributes.leader.data?.attributes.username.charAt(0)}</Avatar>}
                    label={team.attributes.leader.data?.attributes.username}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon fontSize="small" />
                    Takım Üyeleri:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {team.attributes.members.data?.map((member) => (
                      <Tooltip key={member.id} title={member.attributes.email}>
                        <Chip
                          avatar={<Avatar>{member.attributes.username.charAt(0)}</Avatar>}
                          label={member.attributes.username}
                          onDelete={
                            team.attributes.leader.data?.id === user.id 
                              ? () => handleRemoveMember(team.id, member.id)
                              : undefined
                          }
                          size="small"
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Member Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullScreen={fullScreen}
      >
        <DialogTitle>Takım Üyesi Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, minWidth: 300 }}>
            <Autocomplete
              fullWidth
              options={availableUsers.filter(u => 
                !selectedTeam?.attributes.members.data?.find(m => m.id === u.id)
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
                  fullWidth
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={handleAddMember}
            disabled={!selectedUser}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Takımı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedTeam?.attributes.name} takımını silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>İptal</Button>
          <Button onClick={confirmDeleteTeam} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageTeam;