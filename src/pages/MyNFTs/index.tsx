import { Box, Typography, styled, useTheme, useMediaQuery } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchAllOwnedNFTs, isDifferentAddress } from '../../store/slices/mynftSlice';
import NFTCard from '../../components/NFTCard';
import Grid from '../../components/Grid';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { showToast } from '../../store/slices/toastSlice';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';

const CARD_WIDTH = 212;
const CARD_GAP = 12;
const MIN_PADDING = 40;

interface PageContainerProps {
  padding: number;
  hasData: boolean;
}

const PageContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'padding' && prop !== 'hasData'
})<PageContainerProps>(({ theme, padding, hasData }) => ({
  padding: `0 ${padding}px`,
  height: hasData ? '100%' : 'auto',
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  zIndex: 2,
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
  scrollbarWidth: 'thin',
  scrollbarColor: '#4E318D transparent',

  [theme.breakpoints.down('sm')]: {
    padding: '0 20px',
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '22px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
  margin: '30px 0',

  [theme.breakpoints.down('sm')]: {
    margin: '24px 0',
  },
}));

export default function MyNFTs() {
  const dispatch = useDispatch<AppDispatch>();
  const { nfts, isLoading } = useSelector((state: RootState) => state.myNft);
  const [containerPadding, setContainerPadding] = useState(MIN_PADDING);
  const [containerWidth, setContainerWidth] = useState(0);
  const { address, isConnected } = useAccount();
  const { authenticated } = usePrivy();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const shouldShowConnect = !authenticated || !isConnected;

  // 计算布局
  useEffect(() => {
    if (isMobile) {
      const containerWidth = window.innerWidth - 40;
      setContainerWidth(containerWidth);
      return;
    }

    const container = document.getElementById('myNftsContainer');
    if (!container) return;

    const calculateLayout = () => {
      const containerWidth = container.offsetWidth;
      const availableWidth = containerWidth - (MIN_PADDING * 2);
      const maxCards = Math.floor((availableWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP));
      const totalCardsWidth = maxCards * CARD_WIDTH + (maxCards - 1) * CARD_GAP;
      const newPadding = Math.max(MIN_PADDING, (containerWidth - totalCardsWidth) / 2);
      setContainerPadding(newPadding);
      setContainerWidth(containerWidth - newPadding * 2);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateLayout);
    });
    resizeObserver.observe(container);

    calculateLayout();
    return () => resizeObserver.disconnect();
  }, [isMobile]);

  // 计算卡片尺寸
  const cardSize = useMemo(() => {
    if (isMobile) {
      // 移动端: (屏幕宽度 - 左右padding - 中间间距) / 2
      return Math.floor((window.innerWidth - 40 - 8) / 2);
    }
    return CARD_WIDTH; // PC 端保持原有尺寸
  }, [isMobile]);

  useEffect(() => {
    if (shouldShowConnect || !address) {
      dispatch(showToast({
        message: 'Please connect your wallet first',
        severity: 'error'
      }));
      return;
    }

    if (nfts.length === 0 || isDifferentAddress(address)) {
      dispatch(fetchAllOwnedNFTs(address));
    } else {
      dispatch(fetchAllOwnedNFTs(address)).catch(error => {
        console.error('Background refresh failed:', error);
      });
    }
  }, [address, shouldShowConnect]);

  return (
    <PageContainer 
      id="myNftsContainer" 
      padding={isMobile ? 20 : containerPadding}
      hasData={nfts.length > 0}
    >
      <Title>MY NFTS</Title>
      
      {containerWidth > 0 && nfts.length > 0 && (
        <>
          <Grid
            items={nfts}
            renderItem={(nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onClick={() => window.open(`https://magiceden.io/item-details/base/${nft.contract}/${nft.id}`, '_blank')}
                width={cardSize}
                height={cardSize}
              />
            )}
            itemWidth={cardSize}
            itemHeight={cardSize}
            gap={isMobile ? 8 : CARD_GAP}
            containerWidth={containerWidth}
            containerId="myNftsContainer"
          />
          <Box sx={{ marginTop: '40px' }} />
        </>
      )}

      {nfts.length === 0 && !isLoading && (
        <EmptyState text="No NFTs found" />
      )}

      {nfts.length === 0 && isLoading && <LoadingState />}
    </PageContainer>
  );
} 