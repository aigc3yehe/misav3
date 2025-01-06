import { configureStore } from '@reduxjs/toolkit';
import collectionReducer from './slices/collectionSlice';
import agentReducer from './slices/agentSlice';
import nftReducer from './slices/nftSlice';
import toastReducer from './slices/toastSlice';
import chatReducer from './slices/chatSlice';
import walletReducer from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    collection: collectionReducer,
    agent: agentReducer,
    nft: nftReducer,
    toast: toastReducer,
    chat: chatReducer,
    wallet: walletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
