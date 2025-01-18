import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// Async thunks
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teams', {
        params: {
          populate: ['members', 'leader', 'tasks']
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const response = await api.post('/teams', {
        data: teamData
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/teams/${id}`, {
        data
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/teams/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  teams: [],
  userTeams: [],
  currentTeam: null,
  loading: false,
  error: null,
  membershipRequests: []
};

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setCurrentTeam: (state, action) => {
      state.currentTeam = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addMembershipRequest: (state, action) => {
      state.membershipRequests.push(action.payload);
    },
    removeMembershipRequest: (state, action) => {
      state.membershipRequests = state.membershipRequests.filter(
        request => request.id !== action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload.data;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Team
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload.data);
      })
      // Update Team
      .addCase(updateTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex(team => team.id === action.payload.data.id);
        if (index !== -1) {
          state.teams[index] = action.payload.data;
        }
      })
      // Delete Team
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter(team => team.id !== action.payload);
      });
  }
});

// Selectors
export const selectTeams = (state) => state.teams.teams;
export const selectUserTeams = (state) => state.teams.userTeams;
export const selectCurrentTeam = (state) => state.teams.currentTeam;
export const selectTeamsLoading = (state) => state.teams.loading;
export const selectTeamsError = (state) => state.teams.error;
export const selectMembershipRequests = (state) => state.teams.membershipRequests;

export const { 
  setCurrentTeam, 
  clearError, 
  addMembershipRequest, 
  removeMembershipRequest 
} = teamSlice.actions;

export default teamSlice.reducer;