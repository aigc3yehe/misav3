import { Box, styled } from '@mui/material';
import pointingCursor from '../assets/pointer.png';
import avatar from '../assets/image_avatar.png';

function formatAddress(address: string | undefined) {
  return address ? address.slice(0, 6) + '...' + address.slice(-4) : '';
}

interface GalleryCardProps {
  imageUrl: string;
  title: string;
  author: string;
  width: number;
  height: number;
  onClick: () => void;
}

const Card = styled(Box)<{ height: number }>(({ height }) => ({
  width: '100%',
  height: height,
  borderRadius: 10,
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '#000',
  cursor: `url(${pointingCursor}), pointer`,
  '&:hover': {
    '& img.main-image': {
      transform: 'scale(1.05)',
    },
    '& .overlay': {
      opacity: 1,
    },
  },
}));

const Image = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.3s ease',
});

const Overlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: '12px 12px 12px 12px',
});

const AuthorSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  
});

const Avatar = styled('img')({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
});

const AuthorAddress = styled('div')({
  color: '#FFFFFF',
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: '100%',
});

const Title = styled('div')({
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  marginBottom: '6px',
});

export default function GalleryCard({ 
  imageUrl, 
  title, 
  author,
  height, 
  onClick 
}: GalleryCardProps) {
  
  return (
    <Card height={height} onClick={onClick}>
      <Image className="main-image" src={imageUrl} alt={title} />
      <Overlay className="overlay">
        <Title>{title}</Title>
        <AuthorSection>
          <Avatar src={avatar} alt="avatar" />
          <AuthorAddress>{formatAddress(author)}</AuthorAddress>
        </AuthorSection>
      </Overlay>
    </Card>
  );
} 