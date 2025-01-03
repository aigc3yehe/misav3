import { configureStore } from '@reduxjs/toolkit';
import agentReducer from './slices/agentSlice';

export const store = configureStore({
  reducer: {
    agent: agentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
