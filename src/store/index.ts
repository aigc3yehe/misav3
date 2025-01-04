import { configureStore } from '@reduxjs/toolkit';
import collectionReducer from './slices/collectionSlice';
import agentReducer from './slices/agentSlice';
import nftReducer from './slices/nftSlice';
import toastReducer from './slices/toastSlice';

export const store = configureStore({
  reducer: {
    collection: collectionReducer,
    agent: agentReducer,
    nft: nftReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
