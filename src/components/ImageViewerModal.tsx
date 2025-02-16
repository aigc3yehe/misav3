import { Dialog, IconButton, styled } from '@mui/material';
import downloadIcon from '../assets/download.svg';

import { closeImageViewer } from '../store/slices/imageViewerSlice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';


const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    margin: 0,
    maxWidth: 'none',
  }
});

const ImageContainer = styled('div')({
  position: 'relative',
  maxWidth: '90vw',
  maxHeight: '90vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const Image = styled('img')<{ originalWidth?: number, originalHeight?: number }>(
  ({ originalWidth, originalHeight }) => ({
    maxWidth: originalWidth ? Math.min(originalWidth, window.innerWidth * 0.9) : '90vw',
    maxHeight: originalHeight ? Math.min(originalHeight, window.innerHeight * 0.9) : '90vh',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  })
);

const DownloadButton = styled(IconButton)({
  position: 'absolute',
  top: 8,
  right: 8,
  padding: 0,
  width: '40px',
  height: '40px',
  '& img': {
    width: '40px',
    height: '40px',
  },
});

export default function ImageViewerModal() {
  const imageUrl = useSelector((state: RootState) => state.imageViewer.imageUrl);
  const width = useSelector((state: RootState) => state.imageViewer.width);
  const height = useSelector((state: RootState) => state.imageViewer.height);
  const open = useSelector((state: RootState) => state.imageViewer.isOpen);
  const dispatch = useDispatch<AppDispatch>();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `image-download.png`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={() => dispatch(closeImageViewer())}
      maxWidth={false}
      onClick={() => dispatch(closeImageViewer())}
    >
      <ImageContainer>
        <DownloadButton onClick={handleDownload}>
          <img src={downloadIcon} alt="download" />
        </DownloadButton>
        <Image 
          src={imageUrl} 
          alt="Image Preview" 
          onClick={(e) => e.stopPropagation()} 
          originalWidth={width}
          originalHeight={height}
        />
      </ImageContainer>
    </StyledDialog>
  );
} 