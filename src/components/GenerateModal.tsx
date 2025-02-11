import { Box, styled, Typography, IconButton } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { closeGenerateModal } from '../store/slices/uiSlice';
import { RootState } from '../store';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import closeIcon from '../assets/close.svg';
import gbgIcon from '../assets/gbg.svg';
import statusIcon from '../assets/status.svg';
import gdownloadIcon from '../assets/gdownload.svg';
import pointingCursor from '../assets/pointer.png';
import resizeIcon from '../assets/resize.svg';
import gokIcon from '../assets/gok.svg';
import { selectCurrentModel } from '../store/slices/modelSlice';
import { keyframes } from '@mui/material/styles';
import { AppDispatch } from '../store';

const ModalOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(21, 15, 32, 0.9)',
  backdropFilter: 'blur(20px)',
  zIndex: 1300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  visibility: 'hidden',
  transition: 'all 0.3s ease',
  padding: '60px',
  willChange: 'transform',  // 优化合成层
  isolation: 'isolate',     // 创建新的堆叠上下文
  
  '&.open': {
    opacity: 1,
    visibility: 'visible'
  },
  
  '& *': {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
  }
});

const ContentContainer = styled(Box)({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '30px',
  willChange: 'transform',  // 优化合成层
  transform: 'translateZ(0)',  // 强制创建新的图层
});

const TitleBar = styled(Box)({
  width: '100%',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',  // 确保标题栏相对定位
  zIndex: 2,  // 确保标题栏在最上层
});

const TitleLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
});

const ModelCover = styled('img')({
  width: '50px',
  height: '50px',
  borderRadius: '4px',
  objectFit: 'cover',
});

const ModelInfo = styled(Box)({
  height: '50px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const ModelLabel = styled(Typography)({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '100%',
  color: '#FFFFFF',
});

const ModelName = styled(Typography)({
  fontSize: '30px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#C7FF8C',
});

const CloseButton = styled(IconButton)({
  padding: 8,
  width: '40px',
  height: '40px',
  cursor: `url(${pointingCursor}), pointer`,
  transform: 'translateZ(0)',
  '& *': {
    pointerEvents: 'none',
  },
  '& img': {
    width: '24px',
    height: '24px',
  },
});

const ImageDisplay = styled(Box)({
  width: '100%',
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `url(${gbgIcon})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  border: '2px solid rgba(78, 49, 141, 0.7)',  // 添加70%透明度
  borderRadius: '4px',
});

const StatusIcon = styled('img')({
  width: '276px',
  height: '118px',
});

const GeneratingContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '60px',
});

const GeneratingStatus = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
});

const GeneratingText = styled(Typography)({
  fontSize: '18px',
  fontWeight: 400,
  lineHeight: '140%',
  color: '#C7FF8C',
});

// 定义进度条动画
const progressAnimation = keyframes`
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
`;

const ProgressBar = styled(Box)({
  width: '438px',
  height: '8px',
  borderRadius: '8px',
  backgroundColor: '#261C3B',
  position: 'relative',
  overflow: 'hidden',
});

const Progress = styled(Box)({
  position: 'absolute',
  width: '50%',  // 设置为50%宽度
  height: '100%',
  backgroundColor: '#C7FF8C',
  borderRadius: '8px',
  animation: `${progressAnimation} 2.5s infinite ease-in-out`,  // 添加循环动画
});

const TipsText = styled(Typography)({
  fontSize: '12px',
  fontWeight: 400,
  color: 'rgba(255, 255, 255, 0.4)',
});

const GeneratedImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
});

interface ImageDisplayContentProps {
  status: 'initial' | 'generating' | 'completed';
  generatedImageUrl?: string;
}

const ImageDisplayContent: React.FC<ImageDisplayContentProps> = ({
  status,
  generatedImageUrl
}) => {
  switch (status) {
    case 'generating':
      return (
        <GeneratingContent>
          <GeneratingStatus>
            <GeneratingText>Image Generating...</GeneratingText>
            <ProgressBar>
              <Progress />
            </ProgressBar>
          </GeneratingStatus>
          <StatusIcon src={statusIcon} alt="Status" />
          <TipsText>Tips: you can view status in My space {'>'} my images</TipsText>
        </GeneratingContent>
      );
    case 'completed':
      return (
        <GeneratedImage src={generatedImageUrl} alt="Generated" />
      );
    case 'initial':
    default:
      return (
        <StatusIcon src={statusIcon} alt="Status" />
      );
  }
};

const ParametersArea = styled(Box)({
  display: 'flex',
  gap: '20px',
  height: '32px',
});

const AspectRatioButton = styled(Box)<{ isOpen: boolean }>(({ isOpen }) => ({
  width: '90px',
  height: '32px',
  borderRadius: '4px',
  border: '1px solid #4E318D',
  backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.3)' : '#4E318D',
  display: 'flex',
  alignItems: 'center',
  padding: '0 14px',
  gap: '14px',
  cursor: `url(${pointingCursor}), pointer`,
  position: 'relative',
  '& img': {  // 只对图片禁用指针事件
    pointerEvents: 'none'
  }
}));

const ResizeIcon = styled('img')({
  width: '20px',
  height: '20px',
});

const RatioText = styled(Typography)({
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '140%',
  color: '#C7FF8C',
});

const RatioMenu = styled(Box)({
  position: 'absolute',
  top: '-8px',
  left: 0,
  transform: 'translateY(-100%)',
  width: '90px',
  backgroundColor: 'rgba(21, 15, 32, 0.95)',
  border: '1px solid #4E318D',
  borderRadius: '4px',
  padding: '8px 0',
  zIndex: 10,
});

const MenuItem = styled(Box)({
  width: '90px',
  height: '34px',
  padding: '0 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '5px',
  cursor: `url(${pointingCursor}), pointer`,
  '& img': {  // 只对图片禁用指针事件
    pointerEvents: 'none'
  }
});

const MenuItemText = styled(Typography)({
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '140%',
  color: '#FFFFFF',
});

const CheckIcon = styled('img')({
  width: '24px',
  height: '24px',
});

interface AspectRatio {
  label: string;
  value: string;
}

const aspectRatios: AspectRatio[] = [
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
];

const PromptInput = styled(Box)({
  width: '100%',
  height: '50px',
  backgroundColor: 'rgba(255, 255, 0, 0.1)', // 临时黄色填充
});

export default function GenerateModal() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isOpen = useSelector((state: RootState) => state.ui.isGenerateModalOpen);
  const currentModel = useSelector(selectCurrentModel);
  const [generationStatus, setGenerationStatus] = useState<'initial' | 'generating' | 'completed'>('generating');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>();
  const [isRatioMenuOpen, setIsRatioMenuOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);

  const handleClose = useCallback(() => {
    document.body.style.overflow = '';
    dispatch(closeGenerateModal());
  }, [dispatch]);

  const handleRatioClick = (ratio: AspectRatio) => {
    setSelectedRatio(ratio);
    setIsRatioMenuOpen(false);  // 选择后关闭菜单
  };

  return (
    <ModalOverlay className={isOpen ? 'open' : ''}>
      <ContentContainer>
        <TitleBar>
          <TitleLeft>
            <ModelCover 
              src={currentModel?.cover || ''} 
              alt={currentModel?.name}
            />
            <ModelInfo>
              <ModelLabel>MODEL</ModelLabel>
              <ModelName>{currentModel?.name || 'Unnamed Model'}</ModelName>
            </ModelInfo>
          </TitleLeft>
          <CloseButton 
            onClick={() => {
              handleClose();
            }}
          >
            <img src={closeIcon} alt="Close" />
          </CloseButton>
        </TitleBar>
        <ImageDisplay>
          <ImageDisplayContent 
            status={generationStatus}
            generatedImageUrl={generatedImageUrl}
          />
        </ImageDisplay>
        <ParametersArea>
          <AspectRatioButton 
            isOpen={isRatioMenuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setIsRatioMenuOpen(!isRatioMenuOpen);
            }}
          >
            <ResizeIcon src={resizeIcon} alt="Resize" />
            <RatioText>{selectedRatio.label}</RatioText>
            {isRatioMenuOpen && (
              <RatioMenu onClick={(e) => e.stopPropagation()}>
                {aspectRatios.map((ratio) => (
                  <MenuItem
                    key={ratio.value}
                    sx={{ 
                      backgroundColor: ratio.value === selectedRatio.value ? '#4E318D' : 'transparent' 
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRatioClick(ratio);
                    }}
                  >
                    <MenuItemText>{ratio.label}</MenuItemText>
                    {ratio.value === selectedRatio.value && (
                      <CheckIcon src={gokIcon} alt="Selected" />
                    )}
                  </MenuItem>
                ))}
              </RatioMenu>
            )}
          </AspectRatioButton>
        </ParametersArea>
        <PromptInput />
      </ContentContainer>
    </ModalOverlay>
  );
} 