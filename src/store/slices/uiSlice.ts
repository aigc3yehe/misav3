import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  isGenerateModalOpen: boolean;
  // ... other UI states
}

const initialState: UiState = {
  isGenerateModalOpen: false,
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
  }
});

export const { openGenerateModal, closeGenerateModal } = uiSlice.actions;
export default uiSlice.reducer; 