import { Box, IconButton, Typography, styled, Checkbox } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Collection } from '../../store/slices/collectionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchNFTs, clearNFTs, fetchOwnedNFTs } from '../../store/slices/nftSlice';
import NFTCard from '../../components/NFTCard';
import backIcon from '../../assets/back.svg';
import Grid from '../../components/Grid';
import copyNFTAddressIcon from '../../assets/copy_nft_address.svg';
import copySuccessIcon from '../../assets/copy_success.svg';
import nftMeIcon from '../../assets/nft_me.svg';
import pointingCursor from '../../assets/pointer.png';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { showToast } from '../../store/slices/toastSlice';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { useTheme, useMediaQuery } from '@mui/material';


const CARD_WIDTH = 212;
const CARD_GAP = 12;
const MIN_PADDING = 40;

// 修改 PageContainer 的类型定义和实现
interface PageContainerProps {
  padding: number;
  hasData: boolean;  // 改为驼峰命名
}

const PageContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'hasData' && prop !== 'padding'
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

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  [theme.breakpoints.down('sm')]: {
    gap: '0px',
    marginTop: '20px',
  },
}));

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

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '22px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
  },
}));

const TitleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  margin: '30px 0',
  [theme.breakpoints.down('sm')]: {
    margin: '20px 0',
    gap: 'auto',
  },
}));

const TopRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const LeftSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  [theme.breakpoints.down('sm')]: {
    gap: '8px',
  },
}));

const CollectionName = styled(Typography)(({ theme }) => ({
  fontSize: '40px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
  [theme.breakpoints.down('sm')]: {
    fontSize: '24px',
  },
}));

const NftIconButton = styled(Box)(({ theme }) => ({
  width: '30px',
  height: '30px',
  cursor: `url(${pointingCursor}), pointer`,
  '& img': {
    width: '100%',
    height: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    width: '24px',
    height: '24px',
  },
}));

const OwnedCheckbox = styled(Checkbox)({
  color: '#FFFFFF',
  '&.Mui-checked': {
    color: '#C7FF8C',
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

const Description = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '100%',
  color: '#D6C0FF',
  [theme.breakpoints.down('sm')]: {
    fontSize: '12px',
  },
}));

export default function NFTGallery() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const collection = location.state?.collection as Collection;
  const { nfts, isLoading } = useSelector((state: RootState) => state.nft);
  const [containerPadding, setContainerPadding] = useState(MIN_PADDING);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isOwned, setIsOwned] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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
    if (collection) {
      dispatch(clearNFTs());
      if (isOwned && address) {
        // 如果是 Owned 状态，使用 fetchOwnedNFTs
        dispatch(fetchOwnedNFTs({ 
          ownerAddress: address, 
          contractAddress: collection.contract 
        }));
      } else {
        // 先尝试获取数据（可能使用缓存）
        dispatch(fetchNFTs({ 
          contractAddress: collection.contract, 
          totalNfts: collection.nfts 
        }));
        
        // 始终在后台刷新数据
        dispatch(fetchNFTs({ 
          contractAddress: collection.contract, 
          totalNfts: collection.nfts,
          isBackground: true 
        }));
      }
    }
    return () => {
      dispatch(clearNFTs());
    };
  }, [collection, isOwned, address]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleOwnedChange = () => {
    if (shouldShowConnect || !address) {
      dispatch(showToast({
        message: 'Please connect your wallet first',
        severity: 'error'
      }));
      return;
    }

    dispatch(clearNFTs());
    setIsOwned(!isOwned);
  };

  const handleNFTMeClick = () => {
    window.open(`https://magiceden.io/collections/base/${collection.contract}`, '_blank');
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(collection.contract);
      setIsCopied(true);
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
    <PageContainer 
      id="nftContainer" 
      padding={isMobile ? 20 : containerPadding}
      hasData={nfts.length > 0}
    >
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
              <img src={isCopied ? copySuccessIcon : copyNFTAddressIcon} alt="Copy NFT Address" />
            </NftIconButton>
            <NftIconButton onClick={handleNFTMeClick}>
              <img src={nftMeIcon} alt="NFT Me" />
            </NftIconButton>
          </LeftSection>
          <OwnedLabel onClick={handleOwnedChange}>
            <OwnedCheckbox
              checked={isOwned}
              size="small"
            />
            <Typography>Owned</Typography>
          </OwnedLabel>
        </TopRow>
        <Description>
          {collection.description || 'No description available'}
        </Description>
      </TitleRow>
      
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
            containerId="nftContainer"
          />
          <Box sx={{ marginTop: '40px' }} />
        </>
      )}

      {isLoading && nfts.length === 0 && (
        <LoadingState />
      )}

      {!isLoading && nfts.length === 0 && (
        <EmptyState text="No NFTs found" />
      )}
    </PageContainer>
  );
} 