import { Box, styled, IconButton, Typography, Tabs, Tab, Button, CircularProgress } from '@mui/material';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backIcon from '../assets/back.svg';
import ImageViewPager from '../components/ImageViewPager';
import createIcon from '../assets/create.svg';
import shareIcon from '../assets/share.svg';
import coinsIcon from '../assets/coins.svg';
import xIcon from '../assets/x.svg';
import avatarIcon from '../assets/avatar.png';
import WaterfallGrid from '../components/WaterfallGrid';
import GalleryCard from '../components/GalleryCard';
import avatar from '../assets/image_avatar.png';

const PageContainer = styled(Box)({
  padding: '0 40px',
  height: '100%',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
});

const ContentContainer = styled(Box)({
  width: '1110px',
  margin: '0 auto',
});

const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '30px 0',
});

const BackButton = styled(IconButton)({
  padding: 0,
  marginLeft: '-10px',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

const BackIcon = styled('img')({
  width: '12px',
  height: '24px',
});

const Title = styled(Typography)({
  fontSize: '22px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
});

const MainSection = styled(Box)({
  display: 'flex',
  gap: '36px',
  marginBottom: '40px',
  marginLeft: '-6px',
});

const InfoPanel = styled(Box)({
  width: '385px',
  height: '400px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  marginRight: '-6px',
});

const ModelTitle = styled(Typography)({
  fontSize: '40px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const AuthorSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const AvatarIcon = styled('img')({
  width: '24px',
  height: '24px',
});

const AuthorAddress = styled(Typography)({
  fontSize: '16px',
  fontWeight: 400,
  color: '#D6C0FF',
});

const XButton = styled(IconButton)({
  padding: 0,
  marginLeft: '-6px',
  width: '28px',
  height: '28px',
  '& img': {
    width: '20px',
    height: '20px',
  },
});

const DescriptionBox = styled(Box)({
  width: '385px',
  height: '184px',
  gap: '6px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '4px',
  padding: '15px 20px',
  display: 'flex',
  flexDirection: 'column',
});

const InfoRow = styled(Box)<{ $withBorder?: boolean }>(({ $withBorder = true }) => ({
  width: '345px',
  height: '34px',
  borderBottom: $withBorder ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const InfoText = styled(Typography)({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '100%',
  color: '#FFFFFF',
});

const ButtonGroup = styled(Box)({
  display: 'flex',
  gap: '10px',
});

const BaseButton = styled(Button)({
  height: '50px',
  borderRadius: '10px',
  padding: 0,
  minWidth: 'auto',
});

const GenerateButton = styled(BaseButton)({
  width: '245px',
  gap: '0px',
  backgroundColor: '#C7FF8C',
  '&:hover': {
    backgroundColor: '#b3ff66',
  },
  '& .MuiButton-startIcon': {
    margin: 0,
    marginRight: '0px',
  },
});

const InfoButton = styled(BaseButton)<{ $bgColor: string }>(({ $bgColor }) => ({
  width: '60px',
  backgroundColor: $bgColor,
  '&:hover': {
    backgroundColor: $bgColor,
    opacity: 0.9,
  },
}));

const ButtonIcon = styled('img')({
  width: '30px',
  height: '30px',
});

const GenerateText = styled(Typography)({
  color: '#000000',
  fontSize: '20px',
  fontWeight: 700,
  lineHeight: '24px',
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
});

const StyledTab = styled(Tab)({
  padding: 0,
  minWidth: 'auto',
  fontSize: '22px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
  '&.Mui-selected': {
    color: '#C7FF8C',
  },
  textTransform: 'none',
});

const TabPanel = styled(Box)({
  padding: '24px 0',
  color: '#D6C0FF',
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: 'auto',
});

const GallerySection = styled(Box)({
  marginTop: '40px',
  position: 'relative',
  minHeight: '500px',
});

const GalleryTitle = styled(Typography)({
  fontSize: '22px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
  marginBottom: '30px',
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

const CARD_WIDTH = 268.5;
const CARD_GAP = 12;

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <TabPanel>{children}</TabPanel>
      )}
    </div>
  );
}

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

export default function ModelDetail() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const loadingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoadingVisible, setIsLoadingVisible] = useState(false);
  const debouncedItems = useDebounce(galleryItems, 150); // 防抖处理列表数据

  const loadMoreItems = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      const newItems = await fetchGalleryItems(page, pageSize);
      
      setGalleryItems(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
        
        if (uniqueNewItems.length === 0 && newItems.length > 0) {
          setHasMore(false);
          return prev;
        }
        
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

  const handleScroll = useCallback((scrollInfo: { scrollTop: number, scrollHeight: number, clientHeight: number }) => {
    const { scrollTop, scrollHeight, clientHeight } = scrollInfo;
    
    if (!loadingRef.current && 
        hasMore && 
        scrollTop > 0 &&
        scrollHeight - (scrollTop + clientHeight) < 200) {
      loadMoreItems();
    }
  }, [loadMoreItems, hasMore]);

  // 初始加载只加载一次
  useEffect(() => {
    if (galleryItems.length === 0) {
      loadMoreItems();
    }
  }, [loadMoreItems]);

  // 示例图片数组
  const images = [
    '/mock/model1.jpg',
    '/mock/model2.jpg',
    '/mock/model3.jpg',
    '/mock/model4.jpg',
    '/mock/model5.jpg',
    '/mock/model6.jpg',
    '/mock/model7.jpg',
    '/mock/model8.jpg',
    '/mock/model9.jpg',
    '/mock/model10.jpg',
  ];

  const handleBack = () => {
    navigate(-1); // 返回上一页
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue > 3) {
      console.log('tab change to 3', event);
    }
  };

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
    <PageContainer ref={containerRef} id="galleryContainer">
      <ContentContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <BackIcon src={backIcon} alt="Back" />
          </BackButton>
          <Title>BACK</Title>
        </Header>
        <MainSection>
          <ImageViewPager 
            items={images} 
            slidesPerView={2}
            spacing={12}
            loop={true}
          />
          <InfoPanel>
            <ModelTitle>
              This is a very long model title that might need two lines to display properly
            </ModelTitle>
            
            <AuthorSection>
              <AvatarIcon src={avatarIcon} alt="Author" />
              <AuthorAddress>0x1234...5678</AuthorAddress>
              <XButton>
                <img src={xIcon} alt="X" />
              </XButton>
            </AuthorSection>

            <DescriptionBox>
              <InfoRow>
                <InfoText>Version</InfoText>
                <InfoText>1.0</InfoText>
              </InfoRow>
              <InfoRow>
                <InfoText>Users</InfoText>
                <InfoText>132</InfoText>
              </InfoRow>
              <InfoRow>
                <InfoText>Published</InfoText>
                <InfoText>2024.12.23</InfoText>
              </InfoRow>
              <InfoRow $withBorder={false}>
                <InfoText>Hash</InfoText>
                <InfoText>234234EB</InfoText>
              </InfoRow>
            </DescriptionBox>

            <ButtonGroup>
              <GenerateButton
                startIcon={<ButtonIcon src={createIcon} alt="Create" />}
              >
                <GenerateText>GENERATE</GenerateText>
              </GenerateButton>
              <InfoButton $bgColor="#FF8A7B">
                <ButtonIcon src={shareIcon} alt="Share" />
              </InfoButton>
              <InfoButton $bgColor="#A176FF">
                <ButtonIcon src={coinsIcon} alt="Coins" />
              </InfoButton>
            </ButtonGroup>
          </InfoPanel>
        </MainSection>

        <StyledTabs 
          value={tabValue} 
          onChange={handleTabChange}
        >
          <StyledTab label="DESCRIPTION" disableRipple />
          <StyledTab label="DATA" disableRipple />
          <StyledTab label="EPOCH" disableRipple />
        </StyledTabs>

        <CustomTabPanel value={tabValue} index={0}>
        The most noticeable difference between the XPlus 3 and XPlus MIX 3 models is the lighting effect. The XPlus 3 delivers an absolute black tone more effectively, while the XPlus MIX 3 excels at warm tones, providing softer light that highlights facial and skin details more clearly.
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={1}>
        For example, in a photo taken in a dark room, the XPlus 3 produces a deeper black background, whereas the MIX 3 makes the face appear brighter and more evenly toned. In outdoor photos under sunlight, the MIX 3 creates a more realistic and natural effect.
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={2}>
        Additionally, there are some differences in hair, skin, and material rendering. Finally, the XPlus 3 Dark model is undoubtedly the darkest version, evoking lighting and atmosphere similar to images set in dungeons. The Dark 3 also introduces more noise, making it ideal for dark art, horror themes, and images that require a gloomy atmosphere.
        </CustomTabPanel>

        <GallerySection>
          <GalleryTitle>GALLERY</GalleryTitle>
          
          <WaterfallGrid
            items={debouncedItems}
            renderItem={(item) => (
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
            )}
            itemWidth={CARD_WIDTH}
            itemHeight={(item) => item.height}
            gap={CARD_GAP}
            containerWidth={1110}
            onScroll={handleScroll}
            containerRef={containerRef}
            threshold={600}
          />

          <LoadingWrapper className={isLoadingVisible ? 'visible' : ''}>
            <CircularProgress size={24} sx={{ color: '#C7FF8C' }} />
          </LoadingWrapper>
        </GallerySection>
      </ContentContainer>
      
    </PageContainer>
  );
} 