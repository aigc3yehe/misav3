import { Box, styled, IconButton, Typography, Tabs, Tab, Button } from '@mui/material';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import backIcon from '../assets/back.svg';
import ImageViewPager from '../components/ImageViewPager';
import createIcon from '../assets/create.svg';
import shareIcon from '../assets/share.svg';
import coinsIcon from '../assets/coins.svg';
import xIcon from '../assets/x.svg';
import voting from '../assets/Voting.svg';
import training from '../assets/training.svg';
import bigLikedIcon from '../assets/big_liked.svg';
import bigLikeIcon from '../assets/big_like.svg';
import bigUnlikeIcon from '../assets/big_unlike.svg';
import avatarIcon from '../assets/avatar.png';
import WaterfallGrid from '../components/WaterfallGrid';
import GalleryCard from '../components/GalleryCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { openImageViewer } from '../store/slices/imageViewerSlice';
import { 
  fetchModelDetail, 
  fetchGalleryImages,
  clearCurrentModel,
  clearGallery,
  selectCurrentModel, 
  selectModelLoading, 
  selectModelError,
  selectGalleryImages,
  selectGalleryLoading,
  selectGalleryTotalCount,
  selectVotingDuration,
  voteModel,
  updateVoteOptimistically,
  selectShouldRefreshGallery,
  setShouldRefreshGallery
} from '../store/slices/modelSlice';
import { formatId, formatDateRange } from '../utils/format';
import { RootState } from '../store';
import { showToast } from '../store/slices/toastSlice';
import { openGenerateModal } from '../store/slices/uiSlice';

function formatAddress(address: string | undefined) {
  return address ? address.slice(0, 6) + '...' + address.slice(-4) : '';
}

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
  height: '100%',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
});

const CenterContainer = styled(Box)({
  flex: 1,  // 占满剩余空间
  display: 'flex',  // 启用flex布局
  alignItems: 'center',  // 垂直居中
  justifyContent: 'center',  // 水平居中
  minHeight: '500px',  // 确保最小高度
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
  height: '80px',
  marginBottom: '0',
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

const InfoRow = styled(Box)<{ withborder?: boolean }>(({ withborder = true }) => ({
  width: '345px',
  height: '34px',
  borderBottom: withborder ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
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
  background: 'linear-gradient(90deg, #C7FF8C 0%, #E8C4EA 43%, #39EDFF 100%)',
  '&:hover': {
    background: 'linear-gradient(90deg, #C7FF8C 0%, #E8C4EA 43%, #39EDFF 100%)',
    opacity: 0.9,
  },
  '& .MuiButton-startIcon': {
    margin: 0,
    marginRight: '0px',
  },
});

const InfoButton = styled(BaseButton)<{ bgcolor: string }>(({ bgcolor }) => ({
  width: '60px',
  backgroundColor: bgcolor,
  '&:hover': {
    backgroundColor: bgcolor,
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
  color: '#D6C0FF',
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: 'auto',
  marginTop: 24
});

const EmptyGallery = styled(Box)({
  color: '#D6C0FF',
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: 'auto',
});

const GallerySection = styled(Box)({
  marginTop: '30px',
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

const CARD_WIDTH = 268.5;
const CARD_GAP = 12;
const PAGE_SIZE = 20;

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
// @ts-ignore
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

const StatusBox = styled(Box)({
  width: '100%',
  height: '82px',
  borderRadius: '4px',
  padding: '15px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  position: 'relative',
});

const StatusBackground = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 386,
  height: 82,
  objectFit: 'cover',
  zIndex: -1,
});

const StatusText = styled(Typography)({
  fontSize: '30px',
  fontWeight: 700,
  lineHeight: '100%',
  color: '#000000',
});

const TimeRangeText = styled(Typography)({
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '100%',
  color: '#000000',
});

const VoteButtonGroup = styled(Box)({
  display: 'flex',
  gap: '10px',
});

const UnlikeButton = styled(Button)({
  width: '80px',
  height: '50px',
  borderRadius: '4px',
  backgroundColor: 'rgba(57, 237, 255, 0.1)',
  border: '1px solid #39EDFF',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: 'rgba(57, 237, 255, 0.2)',
  },
});

const LikeButton = styled(Button)<{ $isLiked: boolean }>(({ $isLiked }) => ({
  width: '295px',
  height: '50px',
  borderRadius: '4px',
  backgroundColor: $isLiked ? '#39EDFF' : 'rgba(57, 237, 255, 0.1)',
  border: '1px solid #39EDFF',
  display: 'flex',
  gap: '10px',
  justifyContent: 'center',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: $isLiked ? '#39EDFF' : 'rgba(57, 237, 255, 0.2)',
  },
}));

const LikeCount = styled(Typography)<{ $isLiked: boolean }>(({ $isLiked }) => ({
  fontSize: '20px',
  fontWeight: 700,
  lineHeight: '100%',
  color: $isLiked ? '#000000' : '#39EDFF',
}));

export default function ModelDetail() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingVisible, setIsLoadingVisible] = useState(false);
  const loadingRef = useRef(false);
  
  const model = useSelector(selectCurrentModel);
  const isLoading = useSelector(selectModelLoading);
  const error = useSelector(selectModelError);
  const galleryImages = useSelector(selectGalleryImages);
  const galleryLoading = useSelector(selectGalleryLoading);
  const totalCount = useSelector(selectGalleryTotalCount);
  const votingDuration = useSelector(selectVotingDuration);
  const walletAddress = useSelector((state: RootState) => state.wallet.address);
  const shouldRefreshGallery = useSelector(selectShouldRefreshGallery);

  // 加载模型详情
  useEffect(() => {
    if (id) {
      dispatch(fetchModelDetail(Number(id)));
    }
    return () => {
      dispatch(clearCurrentModel());
      dispatch(clearGallery());
    };
  }, [dispatch, id]);

  // 加载图片列表
  useEffect(() => {
    if (id) {
      dispatch(fetchGalleryImages({
        page,
        pageSize: PAGE_SIZE,
        model_id: Number(id),
        state: 'success'
      }));
    }
  }, [dispatch, id, page]);

  useEffect(() => {
    setHasMore(galleryImages.length < totalCount);
  }, [galleryImages.length, totalCount]);

  // 处理加载状态显示
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (galleryLoading) {
      timer = setTimeout(() => {
        setIsLoadingVisible(true);
      }, 200);
    } else {
      setIsLoadingVisible(false);
    }
    return () => clearTimeout(timer);
  }, [galleryLoading]);

  const handleLoadMore = useCallback(() => {
    if (!galleryLoading && hasMore) {
      const nextPage = Math.floor(galleryImages.length / PAGE_SIZE) + 1;
      setPage(nextPage);
    }
  }, [galleryLoading, hasMore]);

  const handleScroll = useCallback((scrollInfo: { scrollTop: number, scrollHeight: number, clientHeight: number }) => {
    const { scrollTop, scrollHeight, clientHeight } = scrollInfo;
    if (!loadingRef.current && 
        hasMore && 
        scrollHeight - (scrollTop + clientHeight) < 200) {
      loadingRef.current = true;
      handleLoadMore();
      setTimeout(() => {
        loadingRef.current = false;
      }, 500);
    }
  }, [hasMore, handleLoadMore]);

  const handleBack = () => {
    navigate(-1); // 返回上一页
  };

  const handleLike = async (id: number) => {
    if (!walletAddress) {
      // 处理未登录状态，比如显示提示或跳转到登录页面
      dispatch(showToast({
        message: 'Please connect your wallet first',
        severity: 'error'
      }));
      return;
    }

    // 检查是否已经点赞
    if (model?.model_vote?.state === 1) {
      return;
    }

    const previousState = model?.model_vote?.state;

    // 乐观更新
    dispatch(updateVoteOptimistically({
      modelId: id,
      like: true,
      previousState
    }));

    try {
      await dispatch(voteModel({
        user: walletAddress,
        model_id: id,
        like: true
      })).unwrap();
    } catch (error) {
      console.error('Vote failed:', error);
      // 如果失败，回滚到之前的状态
      dispatch(updateVoteOptimistically({
        modelId: id,
        like: false,
        previousState: 1
      }));
      dispatch(showToast({
        message: 'Vote failed',
        severity: 'error'
      }));
    }
  };

  const handleUnlike = async (id: number) => {
    if (!walletAddress) {
      // 处理未登录状态
      dispatch(showToast({
        message: 'Please connect your wallet first',
        severity: 'error'
      }));
      return;
    }

    // 检查是否已经点踩
    if (model?.model_vote?.state === 2) {
      return;
    }

    const previousState = model?.model_vote?.state;

    // 乐观更新
    dispatch(updateVoteOptimistically({
      modelId: id,
      like: false,
      previousState
    }));

    try {
      await dispatch(voteModel({
        user: walletAddress,
        model_id: id,
        like: false
      })).unwrap();
    } catch (error) {
      console.error('Vote failed:', error);
      // 如果失败，回滚到之前的状态
      dispatch(updateVoteOptimistically({
        modelId: id,
        like: previousState === 1
      }));
      dispatch(showToast({
        message: 'Vote failed',
        severity: 'error'
      }));
    }
  };

  const handleGenerate = () => {
    if (!walletAddress) {
      // 处理未登录状态
      dispatch(showToast({
        message: 'Please connect your wallet first',
        severity: 'error'
      }));
      return;
    }
    dispatch(openGenerateModal());
  };

  useEffect(() => {
    if (shouldRefreshGallery) {
      // 重置页码到第一页
      setPage(1);
      // 从第一页开始重新加载数据
      dispatch(fetchGalleryImages({
        page: 1,
        pageSize: PAGE_SIZE,
        model_id: Number(id),
        state: 'success'
      }));
      dispatch(setShouldRefreshGallery(false));
    }
  }, [shouldRefreshGallery, dispatch, id]);

  if (isLoading) {
    return (
      <PageContainer>
        <ContentContainer>
        <CenterContainer>
          <LoadingWrapper className="visible">
            <LoadingState />
          </LoadingWrapper>
          </CenterContainer>
        </ContentContainer>
      </PageContainer>
    );
  }

  if (error || !model || (!model.id && !model.name)) {
    return (
      <PageContainer>
        <ContentContainer>
          <CenterContainer>
            <EmptyState text="No Model found" />
          </CenterContainer>
        </ContentContainer>
      </PageContainer>
    );
  }

  const getModelStatus = () => {
    const trainState = model.model_tran?.[0]?.train_state;
    return trainState === 2 ? 'Ready' :
           trainState === 1 ? 'Training' :
           trainState === -1 ? 'Failed' : 'Voting';
  };

  const getModelUrls = () => {
    return model.model_tran?.[0]?.urls || [model.cover || ''];
  };

  // 计算缩放后的高度
  const calculateScaledHeight = (image: any) => {
    if (!image.height || !image.width) return 0;
    const aspectRatio = image.width / image.height;
    return Math.round(CARD_WIDTH / aspectRatio);
  };

  const renderStatusContent = () => {
    const status = getModelStatus();
    const isLiked = model.model_vote?.state === 1;
    const formatLikes = (num: number) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    switch (status) {
      case 'Ready':
        return (
          <>
            <DescriptionBox>
              <InfoRow>
                <InfoText>Version</InfoText>
                <InfoText>{model.model_tran?.[0]?.version || 1}</InfoText>
              </InfoRow>
              <InfoRow>
                <InfoText>Users</InfoText>
                <InfoText>{model.usersCount || 0}</InfoText>
              </InfoRow>
              <InfoRow>
                <InfoText>Published</InfoText>
                <InfoText>
                  {model.created_at ? new Date(model.created_at).toLocaleDateString() : 'N/A'}
                </InfoText>
              </InfoRow>
              <InfoRow withborder={false}>
                <InfoText>Status</InfoText>
                <InfoText>{status}</InfoText>
              </InfoRow>
            </DescriptionBox>

            <ButtonGroup>
              <GenerateButton
                startIcon={<ButtonIcon src={createIcon} alt="Create" />}
                onClick={handleGenerate}
              >
                <GenerateText>GENERATE</GenerateText>
              </GenerateButton>
              <InfoButton bgcolor="#FF8A7B">
                <ButtonIcon src={shareIcon} alt="Share" />
              </InfoButton>
              <InfoButton bgcolor="#A176FF">
                <ButtonIcon src={coinsIcon} alt="Coins" />
              </InfoButton>
            </ButtonGroup>
          </>
        );
        
      case 'Voting':
        return (
          <>
            <StatusBox>
              <StatusBackground src={voting} />
              <StatusText>VOTING...</StatusText>
              <TimeRangeText>
              {formatDateRange(votingDuration?.start, votingDuration?.end)}
              </TimeRangeText>
            </StatusBox>
            <VoteButtonGroup>
              <LikeButton 
                $isLiked={isLiked}
                onClick={() => handleLike(model.id)}
              >
                <img 
                  src={isLiked ? bigLikedIcon : bigLikeIcon} 
                  alt="Like" 
                  width={22} 
                  height={12} 
                />
                <LikeCount $isLiked={isLiked}>
                  {formatLikes(model.model_vote?.like || 0)}
                </LikeCount>
              </LikeButton>
              <UnlikeButton onClick={() => handleUnlike(model.id)}>
                <img 
                  src={bigUnlikeIcon} 
                  alt="Unlike" 
                  width={22} 
                  height={14} 
                />
              </UnlikeButton>
            </VoteButtonGroup>
          </>
        );
        
      case 'Training':
        return (
          <StatusBox>
            <StatusBackground src={training} />
            <StatusText>Training...</StatusText>
            <TimeRangeText>Please Wait</TimeRangeText>
          </StatusBox>
        );
        
      default:
        return null;
    }
  };

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
            items={getModelUrls()} 
            slidesPerView={2}
            spacing={12}
            loop={true}
          />
          <InfoPanel>
            <ModelTitle>
              {model.name || 'Unnamed Model'}
            </ModelTitle>
            
            <AuthorSection>
              <AvatarIcon src={avatarIcon} alt="Author" />
              <AuthorAddress>{formatAddress(model.creator)}</AuthorAddress>
              <XButton>
                <img src={xIcon} alt="X" />
              </XButton>
            </AuthorSection>

            {renderStatusContent()}
          </InfoPanel>
        </MainSection>

        <StyledTabs 
          value={0}
        >
          <StyledTab label="DESCRIPTION" disableRipple />
        </StyledTabs>

        <CustomTabPanel value={0} index={0}>
          {model.description || 'This model has no description yet'}
        </CustomTabPanel>

        <GallerySection>
          <GalleryTitle>GALLERY</GalleryTitle>
          
          <WaterfallGrid
            items={galleryImages}
            renderItem={(item) => (
              <GalleryCard
                {...item}
                title={formatId(item.id)}
                author={item.creator || 'unknown'}
                key={item.task_id}
                imageUrl={item.url || ''}
                width={CARD_WIDTH}
                height={calculateScaledHeight(item)}
                onClick={() => dispatch(openImageViewer({
                  imageUrl: item.url || '',
                  width: item.width,
                  height: item.height,
                }))}
              />
            )}
            itemWidth={CARD_WIDTH}
            itemHeight={(item) => calculateScaledHeight(item)}
            gap={CARD_GAP}
            containerWidth={1110}
            onScroll={handleScroll}
            containerRef={containerRef}
            threshold={600}
          />

          {isLoadingVisible && (
            <LoadingWrapper className="visible">
              <LoadingState />
            </LoadingWrapper>
          )}

          {galleryImages.length === 0 && !isLoadingVisible && (
            <EmptyGallery>
              No Creations Yet.
            </EmptyGallery>
          )}
        </GallerySection>
      </ContentContainer>
    </PageContainer>
  );
} 