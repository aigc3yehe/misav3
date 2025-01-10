import { Box, styled } from '@mui/material';
import { NFT } from '../store/slices/nftSlice';
import pointingCursor from '../assets/pointer.png';

interface NFTCardProps {
  nft: NFT;
  onClick: () => void;
  width?: number;
  height?: number;
}

const Card = styled(Box)<{ width?: number; height?: number }>(({ width = 212, height = 212 }) => ({
  width: `${width}px`,
  height: `${height}px`,
  borderRadius: '10px',
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

const Overlay = styled(Box)(({ theme }) => ({
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
  padding: '13px',

  [theme.breakpoints.down('sm')]: {
    opacity: 1,
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 100%)',
    padding: '12px',
  },
}));

const Name = styled('div')(({ theme }) => ({
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',

  [theme.breakpoints.down('sm')]: {
    fontSize: '14px',
  },
}));

export default function NFTCard({ nft, onClick, width, height }: NFTCardProps) {
  return (
    <Card onClick={onClick} width={width} height={height}>
      <Image 
        className="main-image" 
        src={nft.image} 
        alt={nft.name}
        loading="lazy"
      />
      <Overlay className="overlay">
        <Name>{nft.name}</Name>
      </Overlay>
    </Card>
  );
} 