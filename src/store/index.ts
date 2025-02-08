import { configureStore } from '@reduxjs/toolkit';
import collectionReducer from './slices/collectionSlice';
import agentReducer from './slices/agentSlice';
import nftReducer from './slices/nftSlice';
import toastReducer from './slices/toastSlice';
import chatReducer, { walletStatusMiddleware } from './slices/chatSlice';
import walletReducer from './slices/walletSlice';
import terminalReducer from './slices/terminalSlice';
import myNftReducer from './slices/mynftSlice';
import modelReducer from './slices/modelSlice';

export const store = configureStore({
  reducer: {
    collection: collectionReducer,
    agent: agentReducer,
    nft: nftReducer,
    myNft: myNftReducer,
    toast: toastReducer,
    chat: chatReducer,
    wallet: walletReducer,
    terminal: terminalReducer,
    model: modelReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(walletStatusMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
