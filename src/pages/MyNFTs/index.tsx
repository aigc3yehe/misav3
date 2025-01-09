import { Box, Typography, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchAllOwnedNFTs, clearNFTs } from '../../store/slices/nftSlice';
import NFTCard from '../../components/NFTCard';
import Grid from '../../components/Grid';
import { useAccount } from 'wagmi';
import { showToast } from '../../store/slices/toastSlice';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';

const CARD_WIDTH = 212;
const CARD_HEIGHT = 212;
const CARD_GAP = 12;
const MIN_PADDING = 40;

const PageContainer = styled(Box)<{ padding: number, hasData: boolean }>(({ padding, hasData }) => ({
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
}));

const Title = styled(Typography)({
  fontSize: '22px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
  margin: '30px 0',
});

export default function MyNFTs() {
  const dispatch = useDispatch<AppDispatch>();
  const { nfts, isLoading } = useSelector((state: RootState) => state.nft);
  const [containerPadding, setContainerPadding] = useState(MIN_PADDING);
  const [containerWidth, setContainerWidth] = useState(0);
  const { address, isConnected } = useAccount();

  // 计算布局
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!isConnected || !address) {
      dispatch(showToast({
        message: 'Please connect your wallet first',
        severity: 'error'
      }));
      return;
    }

    dispatch(clearNFTs());
    loadNFTs();

    return () => {
      dispatch(clearNFTs());
    };
  }, [address, isConnected]);

  const loadNFTs = async () => {
    if (!address) return;
    
    try {
      await dispatch(fetchAllOwnedNFTs(address));
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    }
  };

  return (
    <PageContainer 
      id="myNftsContainer" 
      padding={containerPadding}
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
              />
            )}
            itemWidth={CARD_WIDTH}
            itemHeight={CARD_HEIGHT}
            gap={CARD_GAP}
            containerWidth={containerWidth}
            containerId="myNftsContainer"
          />
          <Box sx={{ marginTop: '40px' }} />
        </>
      )}

      {nfts.length === 0 && !isLoading && (
        <EmptyState text="No NFTs found" />
      )}

      {isLoading && <LoadingState />}
    </PageContainer>
  );
} 