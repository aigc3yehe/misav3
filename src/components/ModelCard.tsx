import { Box, styled, Typography } from '@mui/material';
import likeIcon from '../assets/like.svg';
import likedIcon from '../assets/liked.svg';
import unlikeIcon from '../assets/unlike.svg';

interface ModelCardProps {
  id: string;
  coverUrl: string;
  name: string;
  likes: number;
  isLiked: boolean;
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
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.9,
  },
});

const CoverImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ContentOverlay = styled(Box)({
  position: 'absolute',
  bottom: 15,
  left: '50%',
  transform: 'translateX(-50%)',
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

const LikeButton = styled(Box)<{ isLiked: boolean }>(({ isLiked }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px',
  gap: '10px',
  borderRadius: 4,
  cursor: 'pointer',
  backgroundColor: isLiked ? '#39EDFF' : 'rgba(0, 0, 0, 0.7)',
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
  cursor: 'pointer',
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

export default function ModelCard({ id, coverUrl, name, likes, isLiked, onLike, onUnlike, onCardClick }: ModelCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('[data-action]')) {
      onCardClick();
    }
  };

  return (
    <Card onClick={handleClick}>
      <CoverImage src={coverUrl} alt={name} />
      <ContentOverlay>
        <ActionRow>
          <LikeButton 
            isLiked={isLiked} 
            onClick={onLike}
            data-action="like"
          >
            <LikeIcon src={isLiked ? likedIcon : likeIcon} alt="like" />
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                lineHeight: '100%',
                color: isLiked ? '#000' : '#fff',
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