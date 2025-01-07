import { Box, Modal, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PreviewModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const PreviewContainer = styled(Box)({
  position: 'relative',
  maxWidth: '90vw',
  maxHeight: '90vh',
  outline: 'none',
});

const CloseButton = styled(Box)({
  position: 'absolute',
  top: -40,
  right: 0,
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#FFFFFF',
  '&:hover': {
    opacity: 0.8
  }
});

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '90vh',
  objectFit: 'contain'
});

interface ImagePreviewProps {
  open: boolean;
  src: string;
  onClose: () => void;
}

export default function ImagePreview({ open, src, onClose }: ImagePreviewProps) {
  return (
    <PreviewModal
      open={open}
      onClose={onClose}
      onClick={onClose}
    >
      <PreviewContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
        <PreviewImage src={src} alt="Preview" />
      </PreviewContainer>
    </PreviewModal>
  );
} 