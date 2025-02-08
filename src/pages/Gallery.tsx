import { Box, styled, Typography } from '@mui/material';
import { useEffect, useState, useCallback, useRef } from 'react';
import pointingCursor from '../assets/pointer.png';
import WaterfallGrid from '../components/WaterfallGrid';
import GalleryCard from '../components/GalleryCard';
import outlineRight from '../assets/outline_right.svg';
import generateImage from '../assets/generate_image.jpg';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import {
  fetchGalleryList,
  clearGalleryList,
  selectGalleryList,
  selectGalleryListLoading,
  selectGalleryListTotalCount,
  selectGalleryListError
} from '../store/slices/modelSlice';
import { formatId } from '../utils/format';

const CARD_WIDTH = 268.5;
const ADD_CARD_HEIGHT = 463;
const CARD_GAP = 12;
const MIN_PADDING = 40;
const PAGE_SIZE = 20;

const PageContainer = styled(Box)<{ padding: number }>(({ padding }) => ({
  padding: `0 ${padding}px`,
  height: '100%',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '4px',
    background: 'transparent',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#4E318D',
    borderRadius: '2px',
    '&:hover': {
      background: '#6B44C1',
    },
  },
  // Firefox
  scrollbarWidth: 'thin',
  scrollbarColor: '#4E318D transparent',
}));

const AddGalleryCard = styled(Box)({
  width: CARD_WIDTH,
  height: ADD_CARD_HEIGHT,
  borderRadius: 10,
  overflow: 'hidden',
  position: 'relative',
  cursor: `url(${pointingCursor}), pointer`,
  '&:hover': {
    opacity: 0.8,
  },
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

const Title = styled(Typography)({
  fontSize: '22px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
  marginTop: '22px',
  marginBottom: '30px',
});

const BackgroundImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const TextGenerate = styled(Typography)({
  position: 'absolute',
  left: 12,
  top: 53,
  fontSize: 40,
  fontWeight: 'black',
  lineHeight: '100%',
  color: '#FFFFFF',
});

const TextImage = styled(Typography)({
  position: 'absolute',
  left: 12,
  top: 95,
  fontSize: 40,
  fontWeight: 'black',
  lineHeight: '100%',
  color: '#FFFFFF',
});

const OutlineIcon = styled('img')({
  position: 'absolute',
  width: 37,
  height: 37,
  left: 142,
  top: 95,
});

export default function Gallery() {
  const dispatch = useDispatch<AppDispatch>();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingVisible, setIsLoadingVisible] = useState(false);
  const [containerPadding, setContainerPadding] = useState(MIN_PADDING);
  const loadingRef = useRef(false);

  const galleryList = useSelector(selectGalleryList);
  const isLoading = useSelector(selectGalleryListLoading);
  const totalCount = useSelector(selectGalleryListTotalCount);
  const error = useSelector(selectGalleryListError);

  // 初始加载
  useEffect(() => {
    dispatch(fetchGalleryList({ page: 1, pageSize: PAGE_SIZE }));
    return () => {
      dispatch(clearGalleryList());
    };
  }, [dispatch]);

  // 更新是否有更多数据
  useEffect(() => {
    setHasMore(galleryList.length < totalCount);
  }, [galleryList.length, totalCount]);

  // 处理加载状态显示
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoadingVisible(true);
      }, 200);
    } else {
      setIsLoadingVisible(false);
      // 确保loading状态被重置
      loadingRef.current = false;
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  // 动态计算布局
  useEffect(() => {
    const container = document.getElementById('galleryContainer');
    if (!container) return;

    const calculateLayout = () => {
      const containerWidth = container.offsetWidth;
      const availableWidth = containerWidth - (MIN_PADDING * 2);
      const maxCards = Math.floor((availableWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP));
      const totalCardsWidth = maxCards * CARD_WIDTH + (maxCards - 1) * CARD_GAP;
      const newPadding = Math.max(MIN_PADDING, (containerWidth - totalCardsWidth) / 2);
      setContainerPadding(newPadding);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateLayout);
    });
    resizeObserver.observe(container);

    calculateLayout();
    return () => resizeObserver.disconnect();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && !loadingRef.current) {
      loadingRef.current = true;
      
      // 通过当前数据量计算下一页的页码
      const nextPage = Math.floor(galleryList.length / PAGE_SIZE) + 1;
      console.log('next page:', {
        currentItems: galleryList.length,
        pageSize: PAGE_SIZE,
        nextPage
      });
      
      dispatch(fetchGalleryList({ page: nextPage, pageSize: PAGE_SIZE }))
        .finally(() => {
          loadingRef.current = false;
        });
    } else {
      console.log('跳过加载:', {
        isLoading,
        hasMore,
        currentlyLoading: loadingRef.current
      });
    }
  }, [dispatch, isLoading, hasMore]);

  const handleScroll = useCallback((scrollInfo: { scrollTop: number, scrollHeight: number, clientHeight: number }) => {
    const { scrollTop, scrollHeight, clientHeight } = scrollInfo;
    console.log('Gallery status:', {
      hasMore,
      scrollTop,
      scrollHeight,
      clientHeight,
      distance: scrollHeight - (scrollTop + clientHeight),
      loading: loadingRef.current
    });
    
    if (!loadingRef.current && 
        hasMore && 
        scrollHeight - (scrollTop + clientHeight) < 200) {
      console.log('Gallery load more');
      handleLoadMore();
    }
  }, [hasMore, handleLoadMore]);

  // 计算缩放后的高度
  const calculateScaledHeight = (image: any) => {
    if (!image.height || !image.width) return 0;
    const aspectRatio = image.width / image.height;
    return Math.round(CARD_WIDTH / aspectRatio);
  };

  return (
    <PageContainer padding={containerPadding} ref={containerRef} id="galleryContainer">
      <Title>GALLERY</Title>
      
      <WaterfallGrid
        items={galleryList}
        renderItem={(item) => (
          item.isAddCard ? (
            <AddGalleryCard key="add">
              <BackgroundImage src={generateImage} alt="Generate background" />
              <TextGenerate>GENERATE</TextGenerate>
              <TextImage>IMAGE</TextImage>
              <OutlineIcon src={outlineRight} alt="Generate" />
            </AddGalleryCard>
          ) : (
            <GalleryCard
              {...item}
              title={formatId(item.id)}
              author={item.creator || 'unknown'}
              key={item.task_id}
              imageUrl={item.url || ''}
              width={CARD_WIDTH}
              height={calculateScaledHeight(item)}
              onClick={() => {/* handle click */}}
            />
          )
        )}
        itemWidth={CARD_WIDTH}
        itemHeight={(item) => item.isAddCard ? ADD_CARD_HEIGHT : calculateScaledHeight(item)}
        gap={CARD_GAP}
        containerWidth={(document.getElementById('galleryContainer')?.offsetWidth ?? 0) - containerPadding * 2}
        onScroll={handleScroll}
        containerRef={containerRef}
        threshold={600}
      />
      {isLoadingVisible && (
        <LoadingWrapper className="visible">
          <LoadingState />
        </LoadingWrapper>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      {galleryList.length === 0 && !isLoadingVisible && (
        <EmptyState text="No Images found" />
      )}
    </PageContainer>
  );
}