import { Box, styled, Typography, Link } from '@mui/material';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import arrowIcon from '../assets/arrow.svg';
import addIcon from '../assets/add.svg';
import ModelCard from '../components/ModelCard';
import EnabledModelCard from '../components/EnabledModelCard';
import VirtualizedGrid from '../components/VirtualizedGrid';
import pointingCursor from '../assets/pointer.png';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { 
  fetchVotingModels, 
  fetchEnabledModels,
  selectVotingModels, 
  selectVotingModelsLoading,
  selectEnabledModels,
  selectEnabledModelsTotalCount,
  selectEnabledModelsLoading,
  selectVotingDuration,
  updateVoteOptimistically
} from '../store/slices/modelSlice';
import { formatDateRange } from '../utils/format';
import { showToast } from '../store/slices/toastSlice';
import { voteModel } from '../store/slices/modelSlice';
import { RootState } from '../store';


const CARD_WIDTH = 175;
const CARD_GAP = 12;
const MIN_PADDING = 40;
const SCROLLBAR_WIDTH = 17; // Windows 系统默认滚动条宽度
const PAGE_SIZE = 20
const PAGE_ENABLED_SIZE = 20

const PageContainer = styled(Box)<{ padding: number }>(({ padding }) => ({
  padding: `0 ${padding}px`,
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

//@ts-ignore
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
  cursor: `url(${pointingCursor}), pointer`,
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

const LoadingWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out',
  '&.visible': {
    opacity: 1,
  },
  height: 128,
  [theme.breakpoints.down('sm')]: {
    height: '4rem',
  },
}));

export default function Models() {
  const navigate = useNavigate();
  const [containerPadding, setContainerPadding] = useState(MIN_PADDING);
  const [cardsPerRow, setCardsPerRow] = useState(6);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const votingModels = useSelector(selectVotingModels);
  const votingModelsLoading = useSelector(selectVotingModelsLoading);
  const isLoading = useSelector(selectEnabledModelsLoading);
  const loadingRef = useRef(false);
  const enabledModels = useSelector(selectEnabledModels);
  const totalCount = useSelector(selectEnabledModelsTotalCount);
  const votingDuration = useSelector(selectVotingDuration);
  const walletAddress = useSelector((state: RootState) => state.wallet.address);

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
    dispatch(fetchEnabledModels({
      page: 1,
      pageSize: PAGE_ENABLED_SIZE,
      order: 'created_at',
      desc: 'desc'
    }))
  }, [dispatch]);

  // 更新是否有更多数据
  useEffect(() => {
    setHasMore(enabledModels.length < totalCount);
  }, [enabledModels.length, totalCount]);

  // 处理加载状态显示
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        setLoading(true);
      }, 200);
    } else {
      setLoading(false);
      // 确保loading状态被重置
      loadingRef.current = false;
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && !loadingRef.current) {
      loadingRef.current = true;
      
      // 通过当前数据量计算下一页的页码
      const nextPage = Math.floor(enabledModels.length / PAGE_SIZE) + 1;
      console.log('next page:', {
        currentItems: enabledModels.length,
        pageSize: PAGE_SIZE,
        nextPage
      });
      
      dispatch(fetchEnabledModels({ 
        page: nextPage, 
        pageSize: PAGE_ENABLED_SIZE,
        order: 'created_at',
        desc: 'desc'
      }))
        .finally(() => {
          loadingRef.current = false;
        });
    }
  }, [dispatch, isLoading, hasMore]);

  const handleLike = async (id: string) => {
    if (!walletAddress) {
      dispatch(showToast({
        message: 'Please connect your wallet first',
        severity: 'error'
      }));
      return;
    }

    const modelId = Number(id);
    const currentModel = votingModels.find(model => model.id === modelId);
    const previousState = currentModel?.model_vote?.state;

    // 如果已经点过赞了，直接返回
    if (previousState === 1) {
      return;
    }

    // 立即更新 UI
    dispatch(updateVoteOptimistically({
      modelId,
      like: true,
      previousState
    }));

    try {
      await dispatch(voteModel({
        user: walletAddress,
        model_id: modelId,
        like: true
      })).unwrap();
    } catch (error) {
      console.error('Vote failed:', error);
      // 如果失败，回滚到之前的状态
      dispatch(updateVoteOptimistically({
        modelId,
        like: false,
        previousState: 1
      }));
      dispatch(showToast({
        message: 'Vote failed',
        severity: 'error'
      }));
    }
  };

  const handleUnlike = async (id: string) => {
    if (!walletAddress) {
      dispatch(showToast({
        message: 'Please connect your wallet first',
        severity: 'error'
      }));
      return;
    }

    const modelId = Number(id);
    const currentModel = votingModels.find(model => model.id === modelId);
    const previousState = currentModel?.model_vote?.state;

    // 如果已经点过不喜欢了，直接返回
    if (previousState === 2) {
      return;
    }

    // 立即更新 UI
    dispatch(updateVoteOptimistically({
      modelId,
      like: false,
      previousState
    }));

    try {
      await dispatch(voteModel({
        user: walletAddress,
        model_id: modelId,
        like: false
      })).unwrap();
    } catch (error) {
      console.error('Vote failed:', error);
      // 如果失败，回滚到之前的状态
      dispatch(updateVoteOptimistically({
        modelId,
        like: previousState === 1,
      }));
      dispatch(showToast({
        message: 'Vote failed',
        severity: 'error'
      }));
    }
  };

  const handleCardClick = (id: string) => {
    navigate(`/models/${id}`);
  };

  // 只显示一行数据（cardsPerRow - 1 是为了给添加按钮留位置）
  const displayModels = votingModels.map(model => ({
    id: model.id.toString(),
    coverUrl: model.cover || '/mock/model1.jpg',
    name: model.name || 'Unnamed Model',
    likes: model.model_vote?.like || 0,
    isliked: model.model_vote?.state === 1, // 直接使用model_vote中的state
  }));

  const handleScroll = useCallback((scrollInfo: { scrollTop: number, scrollHeight: number, clientHeight: number }) => {
    const { scrollTop, scrollHeight, clientHeight } = scrollInfo;
    const threshold = 200; // 距离底部200px时开始加载
    
    if (!loadingRef.current && 
      hasMore && 
      scrollHeight - (scrollTop + clientHeight) < threshold) {
      handleLoadMore();
    }
  }, [hasMore, handleLoadMore]);

  useEffect(() => {
    dispatch(fetchVotingModels({ page: 1, pageSize: PAGE_SIZE }));
  }, [dispatch]);

  // 修改展示enabled模型的部分
  const displayEnabledModels = enabledModels.map(model => ({
    id: model.id.toString(),
    coverUrl: model.cover || '/mock/model1.jpg',
    name: model.name || 'Unnamed Model',
    // 模型的训练状态，0 为未开始，1 为进行中，2 为完成，-1 为失败  
    status: model.model_tran?.[0]?.train_state === 2 ? 'Ready' : 
            model.model_tran?.[0]?.train_state === 1 ? 'Training' : 
            model.model_tran?.[0]?.train_state === -1 ? 'Failed' : 'Voting',
    showStatus: model.model_tran?.[0]?.train_state === 2 ? false : true,
  }));

  if (votingModelsLoading) {
    return (
      <PageContainer id="modelsContainer" padding={containerPadding}>
        <SectionHeader>
          <TitleSection>
            <Title>VOTING MODELS</Title>
          </TitleSection>
          <SeeAllLink href="/voting-models">
            See All Voting
            <ArrowIcon src={arrowIcon} alt="See all" />
          </SeeAllLink>
        </SectionHeader>
      
        <LoadingWrapper  className="visible">
          <LoadingState />
        </LoadingWrapper>
      </PageContainer>
    )
  }


  return (
    <PageContainer id="modelsContainer" padding={containerPadding}>
      <SectionHeader>
        <TitleSection>
          <Title>VOTING MODELS</Title>
          <DateRange>
            {formatDateRange(votingDuration?.start, votingDuration?.end)}
          </DateRange>
        </TitleSection>
        <SeeAllLink href="/voting-models">
          See All Voting
          <ArrowIcon src={arrowIcon} alt="See all" />
        </SeeAllLink>
      </SectionHeader>
      
      <ModelsGrid>
        <>
            {displayModels.slice(0, Math.min(cardsPerRow - 1, displayModels.length)).map(model => (
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
        </>
      </ModelsGrid>

      <Divider />

      <SectionHeader>
        <TitleSection>
          <Title>ENABLED MODELS</Title>
        </TitleSection>
      </SectionHeader>

      <VirtualizedGrid
        items={displayEnabledModels}
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
        containerId="modelsContainer"
      />

      {loading && (
        <LoadingWrapper className="visible">
          <LoadingState />
        </LoadingWrapper>
      )}

      {enabledModels.length === 0 && !loading && (
        <EmptyState text="No Enabled Models found" />
      )}
    </PageContainer>
  );
} 