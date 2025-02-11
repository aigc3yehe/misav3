import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, styled, Tabs, Tab } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import VirtualizedGrid from '../components/VirtualizedGrid';
import EnabledModelCard from '../components/EnabledModelCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import {
  fetchMyModels,
  selectMyModels,
  selectMyModelsLoading,
  selectMyModelsTotalCount,
} from '../store/slices/modelSlice';
import { RootState } from '../store';
import WaterfallGrid from '../components/WaterfallGrid';
import ImageCard from '../components/ImageCard';
import {
  fetchMyImages,
  selectMyImages,
  selectMyImagesLoading,
  selectMyImagesTotalCount,
  clearMyImages
} from '../store/slices/modelSlice';

const PageContainer = styled(Box)({
  minHeight: '100%',
  width: '100%',
  overflow: 'hidden',
});

const StyledTabs = styled(Tabs)({
    '& .MuiTabs-indicator': {
      backgroundColor: '#C7FF8C',
    },
    '& .MuiTabs-flexContainer': {
      gap: '50px',
      justifyContent: 'flex-start',
    },
    minWidth: 'auto',
    marginLeft: 40,
  });
  
const StyledTab = styled(Tab)({
    padding: 0,
    minWidth: 'auto',
    fontSize: '30px',
    fontWeight: 500,
    lineHeight: '100%',
    color: '#FFFFFF',
    '&.Mui-selected': {
      color: '#C7FF8C',
      fontWeight: 800,
    },
    textTransform: 'none',
});

const TabPanel = styled(Box)({
  padding: 0,
});

const BottomBox = styled(Box)({
  height: 32,
});

// @ts-ignore
const GridContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
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

const ContentWrapper = styled(Box)<{ horizontal_padding: number }>(({ horizontal_padding }) => ({
  width: '100%',
  paddingLeft: horizontal_padding,
  paddingRight: horizontal_padding,
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <TabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`myspace-tabpanel-${index}`}
      aria-labelledby={`myspace-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </TabPanel>
  );
}

const CARD_WIDTH = 268.5;
const CARD_HEIGHT = 314;
const CARD_GAP = 12;
const MIN_PADDING = 40;
const SCROLLBAR_WIDTH = 17;
const PAGE_SIZE = 20;

const BottomLoadingWrapper = styled(Box)(({ theme }) => ({
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

const EmptyContainer = styled(Box)({
  height: 'calc(100vh - 120px)', // 减去tabs的高度
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const CenteredLoadingWrapper = styled(Box)({
  height: 'calc(100vh - 120px)', // 减去tabs的高度
  display: 'flex',
  position: 'relative',
  justifyContent: 'center',
  alignItems: 'center',
});

const GALLERY_CARD_WIDTH = 212;
const GALLERY_CARD_GAP = 12;
const GALLERY_PAGE_SIZE = 20;

// @ts-ignore
const GalleryContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
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

const GalleryWrapper = styled(Box)<{ horizontal_padding: number }>(({ horizontal_padding }) => ({
  width: '100%',
  marginTop: 22,
  paddingLeft: horizontal_padding,
  paddingRight: horizontal_padding,
}));

export default function MySpace() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // 从 URL 参数获取初始 tab 值
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab === 'images' ? 1 : 0;
  };

  const [value, setValue] = useState(getInitialTab());

  // 当 URL 参数改变时更新 tab
  useEffect(() => {
    setValue(getInitialTab());
  }, [location.search]);

  // @ts-ignore
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    // 更新 URL 参数
    navigate(`/my-space?tab=${newValue === 0 ? 'models' : 'images'}`, { replace: true });
  };

  const [containerPadding, setContainerPadding] = useState(MIN_PADDING);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const myModels = useSelector(selectMyModels);
  const isLoading = useSelector(selectMyModelsLoading);
  const totalCount = useSelector(selectMyModelsTotalCount);
  const walletAddress = useSelector((state: RootState) => state.wallet.address);

  // 计算布局
  useEffect(() => {
    const container = document.getElementById('myModelsContainer');
    if (!container) return;

    const calculateLayout = () => {
      const containerWidth = container.offsetWidth;
      const hasVerticalScrollbar = container.scrollHeight > container.clientHeight;
      const scrollbarWidth = hasVerticalScrollbar ? SCROLLBAR_WIDTH : 0;
      const availableWidth = containerWidth - (MIN_PADDING * 2) - scrollbarWidth;
      const maxCards = Math.floor((availableWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP));
      const newPadding = Math.max(
        MIN_PADDING,
        (containerWidth - scrollbarWidth - (maxCards * CARD_WIDTH + (maxCards - 1) * CARD_GAP)) / 2
      );
      
      setContainerPadding(newPadding);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateLayout);
    });
    resizeObserver.observe(container);

    calculateLayout();

    return () => {
      resizeObserver.disconnect();
    };
  }, [myModels.length]);

  // 初始加载
  useEffect(() => {
    if (walletAddress) {
      dispatch(fetchMyModels({
        user: walletAddress,
        page: 1,
        pageSize: PAGE_SIZE,
      }));
    }
  }, [dispatch, walletAddress]);

  // 更新是否有更多数据
  useEffect(() => {
    setHasMore(myModels.length < totalCount);
  }, [myModels.length, totalCount]);

  // 处理加载状态
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        setLoading(true);
      }, 200);
    } else {
      setLoading(false);
      loadingRef.current = false;
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && !loadingRef.current && walletAddress) {
      loadingRef.current = true;
      const nextPage = Math.floor(myModels.length / PAGE_SIZE) + 1;
      
      dispatch(fetchMyModels({
        user: walletAddress,
        page: nextPage,
        pageSize: PAGE_SIZE,
      }));
    }
  }, [dispatch, isLoading, hasMore, walletAddress, myModels.length]);

  const handleScroll = useCallback((scrollInfo: { scrollTop: number, scrollHeight: number, clientHeight: number }) => {
    const { scrollTop, scrollHeight, clientHeight } = scrollInfo;
    const threshold = 200;
    
    if (!loadingRef.current && hasMore && scrollHeight - (scrollTop + clientHeight) < threshold) {
      handleLoadMore();
    }
  }, [hasMore, handleLoadMore]);

  const handleCardClick = (id: string) => {
    navigate(`/models/${id}`);
  };

  const [galleryContainerPadding, setGalleryContainerPadding] = useState(MIN_PADDING);
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const [isGalleryLoadingVisible, setIsGalleryLoadingVisible] = useState(false);
  const galleryLoadingRef = useRef(false);
  const galleryContainerRef = useRef<HTMLDivElement>(null);

  const galleryImages = useSelector(selectMyImages);
  const galleryLoading = useSelector(selectMyImagesLoading);
  const galleryTotalCount = useSelector(selectMyImagesTotalCount);

  // 计算图片缩放后的高度
  const calculateScaledHeight = (image: any) => {
    if (!image.height || !image.width) return 0;
    const aspectRatio = image.width / image.height;
    return Math.round(GALLERY_CARD_WIDTH / aspectRatio);
  };

  // Gallery布局计算
  useEffect(() => {
    const container = document.getElementById('myImagesContainer');
    if (!container) return;

    const calculateLayout = () => {
      const containerWidth = container.offsetWidth;
      const hasVerticalScrollbar = container.scrollHeight > container.clientHeight;
      const scrollbarWidth = hasVerticalScrollbar ? SCROLLBAR_WIDTH : 0;
      const availableWidth = containerWidth - (MIN_PADDING * 2) - scrollbarWidth;
      const maxCards = Math.floor((availableWidth + GALLERY_CARD_GAP) / (GALLERY_CARD_WIDTH + GALLERY_CARD_GAP));
      const newPadding = Math.max(
        MIN_PADDING,
        (containerWidth - scrollbarWidth - (maxCards * GALLERY_CARD_WIDTH + (maxCards - 1) * GALLERY_CARD_GAP)) / 2
      );
      
      setGalleryContainerPadding(newPadding);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateLayout);
    });
    resizeObserver.observe(container);

    calculateLayout();

    return () => {
      resizeObserver.disconnect();
    };
  }, [galleryImages.length]);

  const [currentPage, setCurrentPage] = useState(1);

  const handleGalleryLoadMore = useCallback(() => {
    console.log('Load more called:', {
      isLoading: galleryLoading,
      hasMore: hasMoreImages,
      loadingRef: galleryLoadingRef.current,
      currentLength: galleryImages.length,
      totalCount: galleryTotalCount,
      currentPage
    });

    if (!galleryLoading && hasMoreImages && !galleryLoadingRef.current && walletAddress) {
      galleryLoadingRef.current = true;
      const nextPage = currentPage + 1;
      console.log('Fetching next page:', nextPage);
      setCurrentPage(nextPage);
      dispatch(fetchMyImages({
        user: walletAddress,
        page: nextPage,
        pageSize: GALLERY_PAGE_SIZE,
      }));
    }
  }, [galleryLoading, hasMoreImages, walletAddress, galleryImages.length, currentPage]);

  // 重置页码当切换到图片标签页或地址改变时
  useEffect(() => {
    if (value === 1 && walletAddress) {
      setCurrentPage(1);
      dispatch(fetchMyImages({
        user: walletAddress,
        page: 1,
        pageSize: GALLERY_PAGE_SIZE,
      }));
    }
    return () => {
      if (value === 1) {
        dispatch(clearMyImages());
        setCurrentPage(1);
      }
    };
  }, [dispatch, value, walletAddress]);

  // 更新是否有更多图片
  useEffect(() => {
    setHasMoreImages(galleryImages.length < galleryTotalCount);
  }, [galleryImages.length, galleryTotalCount]);

  // 处理图片加载状态显示
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (galleryLoading) {
      timer = setTimeout(() => {
        setIsGalleryLoadingVisible(true);
      }, 200);
    } else {
      setIsGalleryLoadingVisible(false);
      galleryLoadingRef.current = false;
    }
    return () => clearTimeout(timer);
  }, [galleryLoading]);

  const handleGalleryScroll = useCallback((scrollInfo: { scrollTop: number, scrollHeight: number, clientHeight: number }) => {
    const { scrollTop, scrollHeight, clientHeight } = scrollInfo;
    console.log('Scroll Info:', {
      scrollTop,
      scrollHeight,
      clientHeight,
      threshold: scrollHeight - (scrollTop + clientHeight),
      hasMoreImages,
      isLoading: galleryLoadingRef.current
    });
    
    if (!galleryLoadingRef.current && 
        hasMoreImages && 
        scrollHeight - (scrollTop + clientHeight) < 200) {
      console.log('Triggering load more...');
      handleGalleryLoadMore();
    }
  }, [hasMoreImages, handleGalleryLoadMore]);

  // 添加对 hasMoreImages 计算的日志
  useEffect(() => {
    console.log('Updating hasMoreImages:', {
      currentLength: galleryImages.length,
      totalCount: galleryTotalCount,
      hasMore: galleryImages.length < galleryTotalCount
    });
    
    setHasMoreImages(galleryImages.length < galleryTotalCount);
  }, [galleryImages.length, galleryTotalCount]);

  return (
    <PageContainer>
      <StyledTabs 
        value={value} 
        onChange={handleChange}
      >
        <StyledTab label="MY MODELS" disableRipple />
        <StyledTab label="MY IMAGES" disableRipple />
      </StyledTabs>

      <CustomTabPanel value={value} index={0}>
        {myModels.length === 0 ? (
          loading ? (
            <CenteredLoadingWrapper>
              <LoadingState />
            </CenteredLoadingWrapper>
          ) : (
            <EmptyContainer>
              <EmptyState text="No Models found" />
            </EmptyContainer>
          )
        ) : (
          <GridContainer id="myModelsContainer">
            <ContentWrapper horizontal_padding={containerPadding}>
              <VirtualizedGrid
                items={myModels.map(model => ({
                  id: model.id.toString(),
                  coverUrl: model.cover || '/mock/model1.jpg',
                  name: model.name || 'Unnamed Model',
                  status: model.model_tran?.[0]?.train_state === 2 ? 'Ready' :
                         model.model_tran?.[0]?.train_state === 1 ? 'Training' :
                         model.model_tran?.[0]?.train_state === -1 ? 'Failed' : 'Voting',
                  showStatus: model.model_tran?.[0]?.train_state === 2 ? false : true,
                }))}
                renderItem={(model) => (
                  <EnabledModelCard
                    key={model.id}
                    {...model}
                    onCardClick={() => handleCardClick(model.id)}
                  />
                )}
                itemWidth={CARD_WIDTH}
                itemHeight={CARD_HEIGHT}
                gap={CARD_GAP}
                containerWidth={(document.getElementById('myModelsContainer')?.offsetWidth ?? 0) - containerPadding * 2}
                onScroll={handleScroll}
                containerId="myModelsContainer"
              />

              {loading && (
                <BottomLoadingWrapper className="visible">
                  <LoadingState />
                </BottomLoadingWrapper>
              )}


              {myModels.length > 0 && !loading && (
                <BottomBox />
              )}
            </ContentWrapper>
          </GridContainer>
        )}
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        {galleryImages.length === 0 ? (
          isGalleryLoadingVisible ? (
            <CenteredLoadingWrapper>
              <LoadingState />
            </CenteredLoadingWrapper>
          ) : (
            <EmptyContainer>
              <EmptyState text="No Images found" />
            </EmptyContainer>
          )
        ) : (
          <GalleryContainer id="myImagesContainer" ref={galleryContainerRef}>
            <GalleryWrapper horizontal_padding={galleryContainerPadding}>
              <WaterfallGrid
                items={galleryImages}
                renderItem={(item) => (
                  <ImageCard
                    {...item}
                    image_id={item.id}
                    key={item.task_id}
                    imageUrl={item.url || ''}
                    width={GALLERY_CARD_WIDTH}
                    height={calculateScaledHeight(item)}
                    onClick={() => {/* handle click */}}
                  />
                )}
                itemWidth={GALLERY_CARD_WIDTH}
                itemHeight={(item) => calculateScaledHeight(item)}
                gap={GALLERY_CARD_GAP}
                containerWidth={(document.getElementById('myImagesContainer')?.offsetWidth ?? 0) - galleryContainerPadding * 2}
                onScroll={handleGalleryScroll}
                containerRef={galleryContainerRef}
                threshold={200}
              />

              {isGalleryLoadingVisible && (
                <BottomLoadingWrapper className="visible">
                  <LoadingState />
                </BottomLoadingWrapper>
              )}

              {galleryImages.length > 0 && !isGalleryLoadingVisible && (
                <BottomBox />
              )}
            </GalleryWrapper>
          </GalleryContainer>

        )}
      </CustomTabPanel>
    </PageContainer>
  );
} 