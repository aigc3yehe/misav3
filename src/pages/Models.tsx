import { Box, styled, Typography, Link, CircularProgress } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import arrowIcon from '../assets/arrow.svg';
import addIcon from '../assets/add.svg';
import ModelCard from '../components/ModelCard';
import EnabledModelCard from '../components/EnabledModelCard';
import VirtualizedGrid from '../components/VirtualizedGrid';

const CARD_WIDTH = 175;
const CARD_GAP = 12;
const MIN_PADDING = 40;
const SCROLLBAR_WIDTH = 17; // Windows 系统默认滚动条宽度

const PageContainer = styled(Box)<{ $padding: number }>(({ $padding }) => ({
  padding: `0 ${$padding}px`,
  height: '100%',
  overflow: 'auto',
}));

const SectionHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
});

const TitleSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
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
  marginTop: '3px',
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
  marginTop: '22px',
  marginBottom: '22px',
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

const Divider = styled(Box)({
  height: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginTop: '30px',
  marginBottom: '22px',
});

const LoadingWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '80px',
});

// 修改模拟 API 调用，确保每个模型有唯一的 ID
const fetchEnabledModels = (page: number, pageSize: number): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = page * pageSize;
      const models = Array.from({ length: pageSize }, (_, index) => ({
        id: `e${start + index + (page * pageSize)}`,
        coverUrl: `/mock/model${(start + index) % 10 + 1}.jpg`,
        name: `Model ${start + index + 1} ${index % 3 === 0 ? 'with a very long name that will wrap to the next line' : ''}`,
        status: ['Training', 'Ready', 'Processing'][Math.floor(Math.random() * 3)],
      }));
      resolve(models);
    }, 1000);
  });
};

export default function Models() {
  const navigate = useNavigate();
  const [containerPadding, setContainerPadding] = useState(MIN_PADDING);
  const [cardsPerRow, setCardsPerRow] = useState(6);
  const [enabledModels, setEnabledModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 6;
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 添加布局计算的 useEffect
  useEffect(() => {
    const container = document.getElementById('modelsContainer');
    if (!container) return;

    const calculateLayout = () => {
      const containerWidth = container.offsetWidth;
      const hasVerticalScrollbar = container.scrollHeight > container.clientHeight;
      
      // 根据是否有滚动条来计算可用宽度
      const scrollbarWidth = hasVerticalScrollbar ? SCROLLBAR_WIDTH : 0;
      const availableWidth = containerWidth - (MIN_PADDING * 2) - scrollbarWidth;
      
      // 计算每行最多能放几个卡片（包括添加按钮）
      const maxCards = Math.floor((availableWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP));
      
      // 计算实际需要的总宽度
      const totalCardsWidth = maxCards * CARD_WIDTH + (maxCards - 1) * CARD_GAP;
      
      // 计算新的padding
      const newPadding = Math.max(
        MIN_PADDING, 
        (containerWidth - scrollbarWidth - totalCardsWidth) / 2
      );
      
      setCardsPerRow(maxCards);
      setContainerPadding(newPadding);
    };

    // 使用 ResizeObserver 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateLayout);
    });
    resizeObserver.observe(container);

    // 初始计算
    calculateLayout();

    return () => {
      resizeObserver.disconnect();
    };
  }, [enabledModels.length]); // 当列表长度变化时重新计算

  // 修改初始加载逻辑
  useEffect(() => {
    if (isInitialLoad) {
      loadMoreModels();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]); // 只依赖 isInitialLoad

  const loadMoreModels = useCallback(async () => {
    if (loading || !hasMore) {
      return;
    }
    
    setLoading(true);
    try {
      const newModels = await fetchEnabledModels(page, pageSize);

      // 添加去重逻辑
      setEnabledModels(prev => {
        const existingIds = new Set(prev.map(model => model.id));
        const uniqueNewModels = newModels.filter(model => !existingIds.has(model.id));
        return [...prev, ...uniqueNewModels];
      });

      setPage(prev => prev + 1);
      setHasMore(newModels.length === pageSize);
    } catch (error) {
      console.error('❌ Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, pageSize]);

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

  const handleScroll = useCallback((scrollInfo: { scrollTop: number, scrollHeight: number, clientHeight: number }) => {
    const { scrollTop, scrollHeight, clientHeight } = scrollInfo;
    const threshold = 200; // 距离底部200px时开始加载
    
    if (scrollHeight - (scrollTop + clientHeight) < threshold) {
      loadMoreModels();
    }
  }, [loadMoreModels]);

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

      <Divider />

      <SectionHeader>
        <TitleSection>
          <Title>ENABLED MODELS</Title>
        </TitleSection>
      </SectionHeader>

      <VirtualizedGrid
        items={enabledModels}
        renderItem={(model) => (
          <EnabledModelCard
            key={model.id}
            {...model}
            onCardClick={() => handleCardClick(model.id)}
          />
        )}
        itemWidth={268.5}
        itemHeight={314}
        gap={12}
        containerWidth={(document.getElementById('modelsContainer')?.offsetWidth ?? 0) - containerPadding * 2}
        onScroll={handleScroll}
      />

      {loading && (
        <LoadingWrapper>
          <CircularProgress size={24} sx={{ color: '#C7FF8C' }} />
        </LoadingWrapper>
      )}
    </PageContainer>
  );
} 