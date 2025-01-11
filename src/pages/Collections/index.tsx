import { Box, Typography, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchCollections, Collection } from '../../store/slices/collectionSlice';
import SubtractBg from '../../assets/Subtract.svg';
import MiniNFTIcon from '../../assets/mini_nft.svg';
import pointingCursor from '../../assets/pointer.png';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
const CARD_WIDTH = 268;
const CARD_GAP = 12;
const MIN_PADDING = 40;
const SCROLLBAR_WIDTH = 17;

const PageContainer = styled(Box)(({ theme }) => ({
  padding: '24px 40px',
  height: '100%',
  overflow: 'auto',

  [theme.breakpoints.down('sm')]: {
    padding: '24px 20px',
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '22px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
  marginBottom: '24px',

  [theme.breakpoints.down('sm')]: {
    fontSize: '22px',
    fontWeight: 800,
    lineHeight: '100%',
    marginBottom: '30px',
  },
}));

const CollectionGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: `${CARD_GAP}px`,
  flexWrap: 'wrap',

  [theme.breakpoints.down('sm')]: {
    gap: '8px',
    justifyContent: 'space-between',
  },
}));

const CollectionCard = styled(Box)(({ theme }) => {
  // 计算移动端卡片宽度：(屏幕宽度 - 左右padding - 中间间距) / 2
  const mobileCardWidth = `calc((100vw - 40px - 8px) / 2)`;
  // 保持原有宽高比 (314/268 ≈ 1.171642)
  const mobileCardHeight = `calc(${mobileCardWidth} * 1.171642)`;

  return {
    position: 'relative',
    width: '268px',
    height: '314px',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: `url(${pointingCursor}), pointer`,
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },

    [theme.breakpoints.down('sm')]: {
      width: mobileCardWidth,
      height: mobileCardHeight,
    },
  };
});

const BackgroundImage = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '10px',
});

const OverlayImage = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
});

const CollectionName = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  left: '19px',
  bottom: '20px',
  color: '#FFFFFF',
  fontFamily: 'Inter',
  fontSize: '18px',
  fontWeight: 500,
  lineHeight: '100%',
  maxWidth: '164px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  [theme.breakpoints.down('sm')]: {
    left: '12px',
    bottom: '12px',
    fontSize: '0.88rem',
  },
}));

const NFTsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: '19px',
  top: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',

  [theme.breakpoints.down('sm')]: {
    right: '0.8rem',
    top: '0.65rem',
  },
}));

const NFTsCount = styled(Typography)(({ theme }) => ({
  color: '#FFFFFF',
  fontFamily: 'Inter',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: '100%',

  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  },
}));

const NFTIcon = styled('img')(({ theme }) => ({
  width: '20px',
  height: '20px',
  [theme.breakpoints.down('sm')]: {
    width: '0.88rem',
    height: '0.88rem',
  },
}));

const LoadingWrapper = styled('div')({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
});

export default function Collections() {
  const dispatch = useDispatch<AppDispatch>();
  const { collections, isLoading } = useSelector((state: RootState) => state.collection);
  const [containerPadding, setContainerPadding] = useState(MIN_PADDING);
  const navigate = useNavigate();

  // 添加布局计算
  useEffect(() => {
    const container = document.getElementById('collectionsContainer');
    if (!container) return;

    const calculateLayout = () => {
      const containerWidth = container.offsetWidth;
      const hasVerticalScrollbar = container.scrollHeight > container.clientHeight;
      
      // 根据是否有滚动条来计算可用宽度
      const scrollbarWidth = hasVerticalScrollbar ? SCROLLBAR_WIDTH : 0;
      const availableWidth = containerWidth - (MIN_PADDING * 2) - scrollbarWidth;
      
      // 计算每行最多能放几个卡片
      const maxCards = Math.floor((availableWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP));
      
      // 计算实际需要的总宽度
      const totalCardsWidth = maxCards * CARD_WIDTH + (maxCards - 1) * CARD_GAP;
      
      // 计算新的padding
      const newPadding = Math.max(
        MIN_PADDING, 
        (containerWidth - scrollbarWidth - totalCardsWidth) / 2
      );

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
  }, [collections.length]);

  // 修改获取数据的逻辑
  useEffect(() => {
    // 如果没有数据，显示loading状态
    if (collections.length === 0) {
      dispatch(fetchCollections());
    } else {
      // 如果有数据，静默更新
      dispatch(fetchCollections()).catch(error => {
        // 可以选择是否处理错误，因为有旧数据在，所以可以静默失败
        console.error('Background refresh failed:', error);
      });
    }
  }, [dispatch, collections.length]);

  const handleCollectionClick = (collection: Collection) => {
    navigate(`/collections/${collection.id}/nfts`, { 
      state: { collection } 
    });
  };

  if (isLoading && collections.length === 0) {
    return (
      <PageContainer id="collectionsContainer" padding={containerPadding}>
        <LoadingWrapper>
          <LoadingState />
        </LoadingWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer id="collectionsContainer" padding={containerPadding}>
      <Title>COLLECTIONS</Title>
      {collections.length === 0 && !isLoading && (
        <EmptyState text="No collections found" />
      )}
      {collections.length > 0 && (
        <CollectionGrid>
          {collections.map((collection) => (
            <CollectionCard 
            key={collection.id}
            onClick={() => handleCollectionClick(collection)}
          >
            <BackgroundImage 
              src={collection.imageUrl}
              alt={collection.name}
            />
            <OverlayImage 
              src={SubtractBg}
              alt="overlay"
            />
            <CollectionName>{collection.name}</CollectionName>
            <NFTsContainer>
              <NFTsCount>{collection.nfts}</NFTsCount>
              <NFTIcon src={MiniNFTIcon} alt="nft" />
            </NFTsContainer>
          </CollectionCard>
          ))}
        </CollectionGrid>
      )}
    </PageContainer>
  );
} 