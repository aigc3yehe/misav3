import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ImageViewerState {
  isOpen: boolean;
  imageUrl: string;
  width?: number;
  height?: number;
}

const initialState: ImageViewerState = {
  isOpen: false,
  imageUrl: '',
  width: undefined,
  height: undefined,
};

const imageViewerSlice = createSlice({
  name: 'imageViewer',
  initialState,
  reducers: {
    openImageViewer: (state, action: PayloadAction<{
      imageUrl: string;
      width?: number;
      height?: number;
    }>) => {
      state.isOpen = true;
      state.imageUrl = action.payload.imageUrl;
      state.width = action.payload.width;
      state.height = action.payload.height;
    },
    closeImageViewer: (state) => {
      state.isOpen = false;
      state.imageUrl = '';
    },
  },
});

export const { openImageViewer, closeImageViewer } = imageViewerSlice.actions;
export default imageViewerSlice.reducer; 