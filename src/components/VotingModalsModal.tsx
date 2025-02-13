import { Box, styled, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { closeVotingModalsModal } from '../store/slices/uiSlice';
import closeIcon from '../assets/close.svg';
import pointingCursor from '../assets/pointer.png';
import ModelCard from './ModelCard';
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  selectVotingDuration,
  updateVoteOptimistically,
  voteModel,
  selectVotingModelsTotalCount,
  fetchModalVotingModels,
  selectModalVotingModels,
} from '../store/slices/modelSlice';
import { showToast } from '../store/slices/toastSlice';
import { formatDateRange } from '../utils/format';

const ModalOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  zIndex: 1300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  visibility: 'hidden',
  transition: 'all 0.3s ease',
  willChange: 'transform',
  isolation: 'isolate',
  
  '&.open': {
    opacity: 1,
    visibility: 'visible'
  },
  
  '& *': {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
  }
});

const ModalContent = styled(Box)({
  width: '1003px',
  height: '616px',
  backgroundColor: 'rgba(47, 29, 86, 0.95)',
  borderRadius: '10px',
  padding: '40px',
  display: 'flex',
  flexDirection: 'column',
  gap: '30px'
});

const TitleBar = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  position: 'relative',
  height: '30px',
});

const TitleSection = styled(Box)({
  display: 'flex',
  alignItems: 'flex-end',
  gap: '12px',
});

const Title = styled(Typography)({
  fontSize: '30px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
  marginBottom: '-2px',
});

const DateRange = styled(Typography)({
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '100%',
  color: '#D6C0FF',
});

const CloseButton = styled(IconButton)({
  padding: 8,
  width: '40px',
  height: '40px',
  cursor: `url(${pointingCursor}), pointer`,
  position: 'absolute',
  top: '-16px',
  right: '-20px',
  '& img': {
    width: '24px',
    height: '24px',
  },
});

const ModelsGrid = styled(Box)({
    height: 422,
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 175px)',
  gap: '12px',
  rowGap: '12px',
  justifyContent: 'center'  // 居中对齐网格
});

const Pagination = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
});

const PageNumber = styled(Box)<{ active?: boolean }>(({ active }) => ({
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  backgroundColor: active ? '#C7FF8C' : 'transparent',
  border: active ? 'none' : '1px solid #FFFFFF',
  color: active ? '#000000' : '#FFFFFF',
  cursor: `url(${pointingCursor}), pointer`,
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '100%',
  '&:hover': {
    backgroundColor: active ? '#C7FF8C' : 'rgba(255, 255, 255, 0.1)',
  }
}));

const Ellipsis = styled(Box)({
  color: 'rgba(255, 255, 255, 0.6)',
  padding: '0 4px',
});

export default function VotingModalsModal() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const loadingPagesRef = useRef<Set<number>>(new Set());
  
  const isOpen = useSelector((state: RootState) => state.ui.isVotingModalsModalOpen);
  const votingModels = useSelector((state: RootState) => 
    selectModalVotingModels(state, currentPage));
  const totalCount = useSelector(selectVotingModelsTotalCount);
  const votingDuration = useSelector(selectVotingDuration);
  const walletAddress = useSelector((state: RootState) => state.wallet.address);

  // 计算总页数
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // 预加载前后页面的数据
  const preloadAdjacentPages = useCallback((page: number) => {
    const prevPage = page - 1;
    const nextPage = page + 1;

    // 只在没有缓存且未在加载中时加载前一页
    if (prevPage >= 1 && !loadingPagesRef.current.has(prevPage)) {
      loadingPagesRef.current.add(prevPage);
      dispatch(fetchModalVotingModels({ 
        page: prevPage, 
        pageSize: PAGE_SIZE 
      }));
    }

    // 只在没有缓存且未在加载中时加载后一页
    if (nextPage <= totalPages  && !loadingPagesRef.current.has(nextPage)) {
      loadingPagesRef.current.add(nextPage);
      dispatch(fetchModalVotingModels({ 
        page: nextPage, 
        pageSize: PAGE_SIZE 
      }));
    }
  }, [dispatch, totalPages]);

  // 当模态框打开或页码改变时获取数据
  useEffect(() => {
    if (isOpen) {
      // 无论是否有缓存都获取新数据，但有缓存时会先显示缓存内容
      dispatch(fetchModalVotingModels({ 
        page: currentPage, 
        pageSize: PAGE_SIZE 
      }));
      loadingPagesRef.current.add(currentPage);
      // 预加载相邻页面
      preloadAdjacentPages(currentPage);
    }
  }, [dispatch, isOpen, currentPage, preloadAdjacentPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLike = async (id: string) => {
    if (!walletAddress) {
      dispatch(showToast({
        message: 'Please connect your wallet first',
        severity: 'error'
      }));
      return;
    }

    const modelId = Number(id);
    const currentModel = votingModels.find(model => model.id === modelId);
    const previousState = currentModel?.model_vote?.state;

    if (previousState === 1) return;

    dispatch(updateVoteOptimistically({
      modelId,
      like: true,
      previousState
    }));

    try {
      await dispatch(voteModel({
        user: walletAddress,
        model_id: modelId,
        like: true
      })).unwrap();
    } catch (error) {
      dispatch(updateVoteOptimistically({
        modelId,
        like: false,
        previousState: 1
      }));
      dispatch(showToast({
        message: 'Vote failed',
        severity: 'error'
      }));
    }
  };

  const handleUnlike = async (id: string) => {
    if (!walletAddress) {
      dispatch(showToast({
        message: 'Please connect your wallet first',
        severity: 'error'
      }));
      return;
    }

    const modelId = Number(id);
    const currentModel = votingModels.find(model => model.id === modelId);
    const previousState = currentModel?.model_vote?.state;

    if (previousState === 2) return;

    dispatch(updateVoteOptimistically({
      modelId,
      like: false,
      previousState
    }));

    try {
      await dispatch(voteModel({
        user: walletAddress,
        model_id: modelId,
        like: false
      })).unwrap();
    } catch (error) {
      dispatch(updateVoteOptimistically({
        modelId,
        like: true,
        previousState: 2
      }));
      dispatch(showToast({
        message: 'Vote failed',
        severity: 'error'
      }));
    }
  };

  const handleCardClick = (id: string) => {
    dispatch(closeVotingModalsModal())
    navigate(`/models/${id}`);
  };

  const renderPagination = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      // 始终显示第一页
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // 显示当前页附近的页码
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // 始终显示最后一页
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return pages.map((page, index) => 
      typeof page === 'number' ? (
        <PageNumber
          key={index}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </PageNumber>
      ) : (
        <Ellipsis key={index}>...</Ellipsis>
      )
    );
  };

  return (
    <ModalOverlay className={isOpen ? 'open' : ''}>
      <ModalContent>
        <TitleBar>
          <TitleSection>
            <Title>VOTING MODELS</Title>
            <DateRange>
              {formatDateRange(votingDuration?.start, votingDuration?.end)}
            </DateRange>
          </TitleSection>
          <CloseButton onClick={() => dispatch(closeVotingModalsModal())}>
            <img src={closeIcon} alt="close" />
          </CloseButton>
        </TitleBar>

        <ModelsGrid>
          {votingModels.map(model => (
            <ModelCard
              key={model.id}
              id={model.id.toString()}
              coverUrl={model.cover || '/mock/model1.jpg'}
              name={model.name || '未命名模型'}
              likes={model.model_vote?.like || 0}
                isliked={model.model_vote?.state === 1}
                onLike={() => handleLike(model.id.toString())}
                onUnlike={() => handleUnlike(model.id.toString())}
              onCardClick={() => handleCardClick(model.id.toString())}
            />
          ))}
        </ModelsGrid>

        {totalPages > 1 && (
          <Pagination>
            {renderPagination()}
          </Pagination>
        )}
      </ModalContent>
    </ModalOverlay>
  );
} 