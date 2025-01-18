import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  darkMode: localStorage.getItem('darkMode') === 'true',
  snackbar: {
    open: false,
    message: '',
    severity: 'info' // 'success' | 'error' | 'warning' | 'info'
  },
  dialog: {
    open: false,
    title: '',
    content: '',
    confirmLabel: 'Tamam',
    cancelLabel: 'İptal',
    onConfirm: null,
    onCancel: null
  },
  loading: {
    global: false,
    tasks: false,
    teams: false,
    notifications: false
  },
  filters: {
    tasks: {},
    teams: {}
  },
  view: {
    tasks: 'grid', // 'grid' | 'list'
    teams: 'grid'  // 'grid' | 'list'
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    showSnackbar: (state, action) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info'
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    showDialog: (state, action) => {
      state.dialog = {
        ...state.dialog,
        ...action.payload,
        open: true
      };
    },
    hideDialog: (state) => {
      state.dialog.open = false;
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    setView: (state, action) => {
      const { key, value } = action.payload;
      state.view[key] = value;
    }
  }
});

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectDarkMode = (state) => state.ui.darkMode;
export const selectSnackbar = (state) => state.ui.snackbar;
export const selectDialog = (state) => state.ui.dialog;
export const selectLoading = (state) => state.ui.loading;
export const selectFilters = (state) => state.ui.filters;
export const selectView = (state) => state.ui.view;

export const {
  toggleSidebar,
  toggleDarkMode,
  showSnackbar,
  hideSnackbar,
  showDialog,
  hideDialog,
  setLoading,
  setFilter,
  setView
} = uiSlice.actions;

export default uiSlice.reducer;