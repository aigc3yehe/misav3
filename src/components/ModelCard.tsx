import { Box, styled, Typography } from '@mui/material';
import likeIcon from '../assets/like.svg';
import likedIcon from '../assets/liked.svg';
import unlikeIcon from '../assets/unlike.svg';
import pointingCursor from '../assets/pointer.png';

interface ModelCardProps {
  id: string;
  coverUrl: string;
  name: string;
  likes: number;
  isliked: boolean;
  onLike: () => void;
  onUnlike: () => void;
  onCardClick: () => void;
}

const Card = styled(Box)({
  width: 175,
  height: 205,
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
  transition: 'transform 0.3s ease',
});

const ContentOverlay = styled(Box)({
  position: 'absolute',
  bottom: 15,
  left: '50%',
  transform: 'translateX(-50%) !important',
  width: 150,
  height: 50,
});

const ActionRow = styled(Box)({
  display: 'flex',
  justifyContent: 'start',
  gap: '8px',
  alignItems: 'center',
  marginBottom: '8px',
});

const LikeButton = styled(Box)<{ isliked: boolean }>(({ isliked }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px',
  gap: '10px',
  borderRadius: 4,
  cursor: `url(${pointingCursor}), pointer`,
  backgroundColor: isliked ? '#39EDFF' : 'rgba(0, 0, 0, 0.7)',
  '&:hover': {
    opacity: 0.8,
  },
}));

const UnlikeButton = styled(Box)({
  width: 30,
  height: 30,
  borderRadius: 4,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: `url(${pointingCursor}), pointer`,
  '&:hover': {
    opacity: 0.8,
  },
});

const LikeIcon = styled('img')({
  width: 14,
  height: 8,
});

const ModelName = styled(Typography)({
  fontSize: 16,
  fontWeight: 500,
  lineHeight: '100%',
  color: '#fff',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export default function ModelCard({ id, coverUrl, name, likes, isliked, onLike, onUnlike, onCardClick }: ModelCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('[data-action]')) {
      onCardClick();
    }
  };

  return (
    <Card onClick={handleClick} id={id}>
      <CoverImage src={coverUrl} alt={name} />
      <ContentOverlay>
        <ActionRow>
          <LikeButton 
            isliked={isliked} 
            onClick={onLike}
            data-action="like"
          >
            <LikeIcon src={isliked ? likedIcon : likeIcon} alt="like" />
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                lineHeight: '100%',
                color: isliked ? '#000' : '#fff',
              }}
            >
              {likes}
            </Typography>
          </LikeButton>
          <UnlikeButton 
            onClick={onUnlike}
            data-action="unlike"
          >
            <LikeIcon src={unlikeIcon} alt="unlike" />
          </UnlikeButton>
        </ActionRow>
        <ModelName>{name}</ModelName>
      </ContentOverlay>
    </Card>
  );
} 