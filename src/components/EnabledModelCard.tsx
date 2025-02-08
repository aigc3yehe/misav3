import { Box, styled, Typography } from '@mui/material';
import { useState } from 'react';
import pointingCursor from '../assets/pointer.png';

interface EnabledModelCardProps {
  id: string;
  coverUrl: string;
  name: string;
  status: string;
  onCardClick: () => void;
  showStatus: boolean;
}


const Card = styled(Box)({
  width: 268,
  height: 314,
  borderRadius: 10,
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '#000',
  cursor: `url(${pointingCursor}), pointer`,
  '&:hover': {
    opacity: 0.9,
    '& img': {
      transform: 'scale(1.05)',
    },
  },
});

const CoverImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: 0,
  transition: 'opacity 0.2s, transform 0.3s ease',
  '&.loaded': {
    opacity: 1,
  },
});

const ContentOverlay = styled(Box)({
  position: 'absolute',
  bottom: 15,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 243,
});

const ModelName = styled(Typography)({
  fontSize: 16,
  fontWeight: 500,
  lineHeight: '100%',
  color: '#fff',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginTop: '4px',
});

const StatusLabel = styled(Box)({
  display: 'inline-block',
  padding: '6px 8px',
  backgroundColor: '#fff',
  borderRadius: 12,
});

const StatusText = styled(Typography)({
  fontSize: 12,
  fontWeight: 500,
  lineHeight: '100%',
  color: '#000',
});

export default function EnabledModelCard({ id, coverUrl, name, status, onCardClick, showStatus }: EnabledModelCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card onClick={onCardClick} id={id}>
      <CoverImage 
        src={coverUrl} 
        alt={name} 
        className={imageLoaded ? 'loaded' : ''}
        onLoad={() => setImageLoaded(true)}
      />
      <ContentOverlay>
        {showStatus && (
          <StatusLabel>
            <StatusText>{status}</StatusText>
          </StatusLabel>
        )}
        <ModelName>{name}</ModelName>

      </ContentOverlay>
    </Card>
  );
} 