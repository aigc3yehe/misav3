import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  isGenerateModalOpen: boolean;
  isVotingModalsModalOpen: boolean;
  // ... other UI states
}

const initialState: UiState = {
  isGenerateModalOpen: false,
  isVotingModalsModalOpen: false,
  // ... other initial states
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openGenerateModal: (state) => {
      state.isGenerateModalOpen = true;
    },
    closeGenerateModal: (state) => {
      state.isGenerateModalOpen = false;
    },
    openVotingModalsModal: (state) => {
      state.isVotingModalsModalOpen = true;
    },
    closeVotingModalsModal: (state) => {
      state.isVotingModalsModalOpen = false;
    },
  }
});

export const { openGenerateModal, closeGenerateModal, openVotingModalsModal, closeVotingModalsModal } = uiSlice.actions;
export default uiSlice.reducer; 