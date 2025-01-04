import { configureStore } from '@reduxjs/toolkit';
import collectionReducer from './slices/collectionSlice';
import agentReducer from './slices/agentSlice';
import nftReducer from './slices/nftSlice';

export const store = configureStore({
  reducer: {
    collection: collectionReducer,
    agent: agentReducer,
    nft: nftReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
