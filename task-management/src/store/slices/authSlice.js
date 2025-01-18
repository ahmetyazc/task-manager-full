import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth';
import api from '../../utils/axios';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await authService.login(email, password);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.register(userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      return await authService.updateProfile(userId, userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.checkAuth();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  user: null,
  jwt: localStorage.getItem('jwt') || null,
  isAuthenticated: false,
  loading: false,
  error: null,
  notifications: [],
  unreadNotificationsCount: 0,
  userRole: null,
  teams: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.jwt = action.payload.jwt;
      state.userRole = action.payload.user.role;
      state.teams = action.payload.user.teams?.data || [];
      localStorage.setItem('jwt', action.payload.jwt);
      api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.jwt}`;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.jwt = null;
      state.userRole = null;
      state.teams = [];
    },
    logout: (state) => {
      state.user = null;
      state.jwt = null;
      state.isAuthenticated = false;
      state.userRole = null;
      state.teams = [];
      state.notifications = [];
      state.unreadNotificationsCount = 0;
      localStorage.removeItem('jwt');
      delete api.defaults.headers.common['Authorization'];
    },
    updateNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadNotificationsCount = action.payload.filter(n => !n.attributes.read).length;
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.attributes.read = true;
        state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
      }
    },
    updateUserTeams: (state, action) => {
      state.teams = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.jwt = action.payload.jwt;
        state.userRole = action.payload.user.role;
        state.teams = action.payload.user.teams?.data || [];
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.jwt = action.payload.jwt;
        state.userRole = action.payload.user.role;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      // Check Auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.userRole = action.payload.role;
        state.teams = action.payload.teams?.data || [];
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.jwt = null;
        state.userRole = null;
        state.teams = [];
      });
  },
});

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.userRole;
export const selectUserTeams = (state) => state.auth.teams;
export const selectNotifications = (state) => state.auth.notifications;
export const selectUnreadNotificationsCount = (state) => state.auth.unreadNotificationsCount;

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateNotifications,
  markNotificationAsRead,
  updateUserTeams,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;