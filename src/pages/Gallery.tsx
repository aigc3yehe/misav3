import { Box, styled, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import pointingCursor from '../assets/pointer.png';
import WaterfallGrid from '../components/WaterfallGrid';
import GalleryCard from '../components/GalleryCard';
import outlineRight from '../assets/outline_right.svg';
import generateImage from '../assets/generate_image.jpg';
import avatar from '../assets/image_avatar.png';

const CARD_WIDTH = 269;
const ADD_CARD_HEIGHT = 463;
const CARD_GAP = 12;
const MIN_PADDING = 40;

const PageContainer = styled(Box)<{ $padding: number }>(({ $padding }) => ({
  padding: `0 ${$padding}px`,
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

const LoadingWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '80px',
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out',
  '&.visible': {
    opacity: 1,
  },
});

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

// 模拟 API 调用，返回不同高度的图片数据
const fetchGalleryItems = (page: number, pageSize: number): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = page * pageSize;
      const items = Array.from({ length: pageSize }, (_, index) => ({
        id: `g${start + index}`,
        imageUrl: `/mock/gallery${(start + index) % 10 + 1}.jpg`,
        height: Math.floor(Math.random() * 200 + 300), // 随机高度 300-500px
        title: `Gallery Item ${start + index + 1}`,
        author: {
          avatar: `${avatar}`,  // 统一使用 image_avatar.png
          address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}` // 生成模拟的地址
        }
      }));
      resolve(items);
    }, 1000);
  });
};

// 添加防抖函数
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Gallery() {
  const navigate = useNavigate();
  const [containerPadding, setContainerPadding] = useState(MIN_PADDING);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const galleryContainerRef = useRef<HTMLDivElement>(null); // 添加 ref
  const [isLoadingVisible, setIsLoadingVisible] = useState(false);
  const debouncedItems = useDebounce(galleryItems, 150);

  const loadMoreItems = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log('Starting to load more items...');
      const newItems = await fetchGalleryItems(page, pageSize);
      
      setGalleryItems(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
        
        if (uniqueNewItems.length === 0 && newItems.length > 0) {
          setHasMore(false);
          return prev;
        }
        
        console.log(`Adding ${uniqueNewItems.length} new items`);
        return [...prev, ...uniqueNewItems];
      });
      
      setPage(prev => prev + 1);
      setHasMore(newItems.length === pageSize);
    } catch (error) {
      console.error('Failed to load gallery items:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [page, hasMore, pageSize]);

  const checkAndLoadMore = useCallback(() => {
    const container = document.getElementById('galleryContainer');
    if (!container) return;

    const { scrollTop, clientHeight, scrollHeight } = container;
    if (scrollHeight <= clientHeight || scrollHeight - (scrollTop + clientHeight) < 200) {
      loadMoreItems();
    }
  }, [loadMoreItems]);

  const handleScroll = useCallback((scrollInfo: { scrollTop: number, scrollHeight: number, clientHeight: number }) => {
    const { scrollTop, scrollHeight, clientHeight } = scrollInfo;
    console.log('Gallery scroll handler called:', { 
      scrollTop, 
      scrollHeight, 
      clientHeight,
      isLoading: loadingRef.current,
      hasMore
    });
    
    if (!loadingRef.current && hasMore && scrollHeight - (scrollTop + clientHeight) < 200) {
      console.log('Attempting to load more items...');
      loadMoreItems();
    }
  }, [loadMoreItems, hasMore]);

  // Layout 计算
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

  // 初始加载
  useEffect(() => {
    if (isInitialLoad) {
      loadMoreItems();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, loadMoreItems]);

  // 监听内容变化
  useEffect(() => {
    checkAndLoadMore();
  }, [galleryItems.length, checkAndLoadMore]);

  // 处理加载状态的显示
  useEffect(() => {
    let timer: number;
    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoadingVisible(true);
      }, 200);
    } else {
      setIsLoadingVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <PageContainer id="galleryContainer" $padding={containerPadding} ref={galleryContainerRef}>
      <Title>GALLERY</Title>
        
      <WaterfallGrid
        items={[{ id: 'add', isAddCard: true }, ...debouncedItems]}
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
              key={item.id}
              {...item}
              width={CARD_WIDTH}
              onClick={() => navigate(`/gallery/${item.id}`)}
              style={{
                opacity: 0,
                animation: 'fadeIn 0.3s ease-in-out forwards',
              }}
            />
          )
        )}
        itemWidth={CARD_WIDTH}
        itemHeight={(item) => item.isAddCard ? ADD_CARD_HEIGHT : item.height}
        gap={CARD_GAP}
        containerWidth={(document.getElementById('galleryContainer')?.offsetWidth ?? 0) - containerPadding * 2}
        onScroll={handleScroll}
        containerRef={galleryContainerRef}
      />

      <LoadingWrapper className={isLoadingVisible ? 'visible' : ''}>
        <CircularProgress size={24} sx={{ color: '#C7FF8C' }} />
      </LoadingWrapper>
    </PageContainer>
  );
}