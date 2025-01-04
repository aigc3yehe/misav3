import { Box, IconButton, Typography, styled, CircularProgress, Checkbox } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Collection } from '../../store/slices/collectionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchNFTs, clearNFTs, fetchOwnedNFTs } from '../../store/slices/nftSlice';
import NFTCard from '../../components/NFTCard';
import backIcon from '../../assets/back.svg';
import Grid from '../../components/Grid';
import copyNFTAddressIcon from '../../assets/copy_nft_address.svg';
import nftMeIcon from '../../assets/nft_me.svg';
import pointingCursor from '../../assets/pointer.png';
import { useAccount } from 'wagmi';
import { showToast } from '../../store/slices/toastSlice';

const CARD_WIDTH = 212;
const CARD_HEIGHT = 212;
const CARD_GAP = 12;
const MIN_PADDING = 40;

const PageContainer = styled(Box)<{ padding: number }>(({ padding }) => ({
  padding: `0 ${padding}px`,
  height: '100%',
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

const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
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

const TitleRow = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  margin: '30px 0',
});

const TopRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const LeftSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
});

const CollectionName = styled(Typography)({
  fontSize: '40px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
});

const NftIconButton = styled(Box)({
  width: '30px',
  height: '30px',
  cursor: `url(${pointingCursor}), pointer`,
  '& img': {
    width: '100%',
    height: '100%',
  },
});

const OwnedCheckbox = styled(Checkbox)({
  color: '#FFFFFF',
  '&.Mui-checked': {
    color: '#D6C0FF',
  },
});

const OwnedLabel = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  cursor: `url(${pointingCursor}), pointer`,
  '& .MuiTypography-root': {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '16px',
    color: '#FFFFFF',
  },
});

const Description = styled(Typography)({
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '100%',
  color: '#D6C0FF',
});

const LoadingWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '80px',
});

export default function NFTGallery() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const collection = location.state?.collection as Collection;
  const { nfts } = useSelector((state: RootState) => state.nft);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [containerPadding, setContainerPadding] = useState(MIN_PADDING);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isOwned, setIsOwned] = useState(false);
  const { address, isConnected } = useAccount();

  // 计算布局
  useEffect(() => {
    const container = document.getElementById('nftContainer');
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
    if (collection) {
      dispatch(clearNFTs());
      handleRefresh();
    }
    return () => {
      dispatch(clearNFTs());
    };
  }, [collection]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await dispatch(fetchNFTs(collection.contract));
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  const handleOwnedChange = async () => {
    if (!isConnected || !address) {
      dispatch(showToast({
        message: 'Please connect your wallet first',
        severity: 'error'
      }));
      return;
    }

    const newValue = !isOwned;
    setIsOwned(newValue);
    
    if (newValue) {
      dispatch(fetchOwnedNFTs({ ownerAddress: address, contractAddress: collection.contract }));
    } else {
      dispatch(fetchNFTs(collection.contract));
    }
  };

  const handleNFTMeClick = () => {
    window.open(`https://magiceden.io/collections/${collection.chain}/${collection.symbol}`, '_blank');
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(collection.contract);
      dispatch(showToast({
        message: 'Copy success',
        severity: 'success'
      }));
    } catch (err) {
      console.error('Copy error:', err);
      dispatch(showToast({
        message: 'Copy failed',
        severity: 'error'
      }));
    }
  };

  if (!collection) {
    return null;
  }

  return (
    <PageContainer id="nftContainer" padding={containerPadding}>
      <Header>
        <BackButton onClick={handleBack}>
            <BackIcon src={backIcon} alt="Back" />
        </BackButton>
        <Title>BACK</Title>
      </Header>
      
      <TitleRow>
        <TopRow>
          <LeftSection>
            <CollectionName>{collection.name}</CollectionName>
            <NftIconButton onClick={handleCopyAddress}>
              <img src={copyNFTAddressIcon} alt="Copy NFT Address" />
            </NftIconButton>
            <NftIconButton onClick={handleNFTMeClick}>
              <img src={nftMeIcon} alt="NFT Me" />
            </NftIconButton>
          </LeftSection>
          <OwnedLabel>
            <OwnedCheckbox
              checked={isOwned}
              onChange={handleOwnedChange}
              size="small"
            />
            <Typography>Owned</Typography>
          </OwnedLabel>
        </TopRow>
        <Description>
          {collection.description || 'No description available'}
        </Description>
      </TitleRow>
      
      {containerWidth > 0 && (
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
          containerId="nftContainer"
        />
      )}

      {isRefreshing ? (
        <LoadingWrapper>
          <CircularProgress size={24} sx={{ color: '#C7FF8C' }} />
        </LoadingWrapper>
      ) : (
        <Box sx={{ marginTop: '40px' }} />
      )}
    </PageContainer>
  );
} 