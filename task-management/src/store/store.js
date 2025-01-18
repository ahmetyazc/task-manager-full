import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER, 
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

// Reducers
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import teamReducer from './slices/teamSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

// Persist config
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // Sadece auth state'ini persist et
};

const rootReducer = combineReducers({
  auth: authReducer,
  tasks: taskReducer,
  teams: teamReducer,
  notifications: notificationReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Middleware
const customMiddleware = (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  });

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: customMiddleware,
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor
export const persistor = persistStore(store);

// Selectors
export const selectAuth = (state) => state.auth;
export const selectTasks = (state) => state.tasks;
export const selectTeams = (state) => state.teams;
export const selectNotifications = (state) => state.notifications;
export const selectUI = (state) => state.ui;

// Store types
export const getState = store.getState;
export const dispatch = store.dispatch;

export default store;