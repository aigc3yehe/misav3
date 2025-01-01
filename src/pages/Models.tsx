import { Box, styled, Typography, Link, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import arrowIcon from '../assets/arrow.svg';
import addIcon from '../assets/add.svg';
import ModelCard from '../components/ModelCard';

const CARD_WIDTH = 175;
const CARD_GAP = 12;
const MIN_PADDING = 40;

const PageContainer = styled(Box)<{ $padding: number }>(({ $padding }) => ({
  padding: `0 ${$padding}px`,
  height: '100%',
  overflow: 'auto',
}));

const SectionHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '30px 0',
});

const TitleSection = styled(Box)({
  display: 'flex',
  alignItems: 'baseline',
  gap: '12px',
});

const Title = styled(Typography)({
  fontSize: '22px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
});

const DateRange = styled(Typography)({
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '100%',
  color: '#D6C0FF',
});

const SeeAllLink = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '100%',
  color: '#C7FF8C',
  textDecoration: 'none',
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'none',
    opacity: 0.8,
  },
});

const ArrowIcon = styled('img')({
  width: '12px',
  height: '24px',
});

const ModelsGrid = styled(Box)({
  display: 'flex',
  gap: `${CARD_GAP}px`,
  flexWrap: 'wrap',
});

const AddModelCard = styled(Box)({
  width: 175,
  height: 205,
  borderRadius: 10,
  backgroundColor: '#4E318D',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
  },
});

const AddIcon = styled('img')({
  width: 37,
  height: 35,
});

const NewStyleText = styled(Typography)({
  fontSize: 16,
  fontWeight: 400,
  lineHeight: '100%',
  color: '#fff',
});

export default function Models() {
  const navigate = useNavigate();
  const [containerPadding, setContainerPadding] = useState(MIN_PADDING);
  const [cardsPerRow, setCardsPerRow] = useState(6);

  // 扩展模拟数据到10条
  const mockModels = [
    { id: '1', coverUrl: '/mock/model1.jpg', name: 'Cool Style Model', likes: 128, isLiked: true },
    { id: '2', coverUrl: '/mock/model2.jpg', name: 'Awesome Long Name Style That Will Be Truncated', likes: 256, isLiked: false },
    { id: '3', coverUrl: '/mock/model3.jpg', name: 'Another Style', likes: 64, isLiked: false },
    { id: '4', coverUrl: '/mock/model4.jpg', name: 'Great Style', likes: 512, isLiked: true },
    { id: '5', coverUrl: '/mock/model5.jpg', name: 'Amazing Style', likes: 1024, isLiked: false },
    { id: '6', coverUrl: '/mock/model6.jpg', name: 'Super Style', likes: 2048, isLiked: true },
    { id: '7', coverUrl: '/mock/model7.jpg', name: 'Fantastic Style', likes: 4096, isLiked: false },
    { id: '8', coverUrl: '/mock/model8.jpg', name: 'Incredible Style', likes: 8192, isLiked: true },
    { id: '9', coverUrl: '/mock/model9.jpg', name: 'Ultimate Style', likes: 16384, isLiked: false },
    { id: '10', coverUrl: '/mock/model10.jpg', name: 'Perfect Style', likes: 32768, isLiked: true },
  ];

  useEffect(() => {
    const calculateLayout = () => {
      const containerWidth = document.getElementById('modelsContainer')?.offsetWidth || 0;
      const availableWidth = containerWidth - (MIN_PADDING * 2);
      
      // 计算每行最多能放几个卡片（包括添加按钮）
      const maxCards = Math.floor((availableWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP));
      
      // 计算实际需要的总宽度
      const totalCardsWidth = maxCards * CARD_WIDTH + (maxCards - 1) * CARD_GAP;
      
      // 计算新的padding
      const newPadding = Math.max(MIN_PADDING, (containerWidth - totalCardsWidth) / 2);
      
      setCardsPerRow(maxCards);
      setContainerPadding(newPadding);
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, []);

  const handleLike = (id: string) => {
    console.log('Like model:', id);
  };

  const handleUnlike = (id: string) => {
    console.log('Unlike model:', id);
  };

  const handleCardClick = (id: string) => {
    navigate(`/models/${id}`);
  };

  // 只显示一行数据（cardsPerRow - 1 是为了给添加按钮留位置）
  const displayModels = mockModels.slice(0, cardsPerRow - 1);

  return (
    <PageContainer id="modelsContainer" $padding={containerPadding}>
      <SectionHeader>
        <TitleSection>
          <Title>VOTING MODELS</Title>
          <DateRange>2024-10-20~2024-11-20</DateRange>
        </TitleSection>
        <SeeAllLink href="/voting-models">
          See All Voting
          <ArrowIcon src={arrowIcon} alt="See all" />
        </SeeAllLink>
      </SectionHeader>
      
      <ModelsGrid>
        {displayModels.map(model => (
          <ModelCard
            key={model.id}
            {...model}
            onLike={() => handleLike(model.id)}
            onUnlike={() => handleUnlike(model.id)}
            onCardClick={() => handleCardClick(model.id)}
          />
        ))}
        <AddModelCard>
          <AddIcon src={addIcon} alt="Add new style" />
          <NewStyleText>New Style</NewStyleText>
        </AddModelCard>
      </ModelsGrid>
    </PageContainer>
  );
} 