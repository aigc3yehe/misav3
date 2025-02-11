import { Box, styled, Typography, IconButton, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { closeGenerateModal } from '../store/slices/uiSlice';
import { RootState } from '../store';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import closeIcon from '../assets/close.svg';
import gbgIcon from '../assets/gbg.svg';
import statusIcon from '../assets/status.svg';
import gdownloadIcon from '../assets/g_download.svg';

import createIcon from '../assets/create.svg';
import pointingCursor from '../assets/pointer.png';
import cursor from '../assets/cursor.png';
import resizeIcon from '../assets/resize.svg';
import gokIcon from '../assets/gok.svg';
import { 
  selectCurrentModel, 
  selectGeneratingStatus, 
  selectGeneratedImageUrl, 
  selectGeneratingTaskId,
  selectGeneratedRatio,
  generateImage,
  checkGenerationStatus,
  resetGeneration,
  AspectRatio,
  aspectRatios
} from '../store/slices/modelSlice';
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

const GeneratedImageContainer = styled(Box)({
  width: '100%',
  maxHeight: '512px',
  marginTop: '16px',
  marginBottom: '16px',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const GeneratedImage = styled('img')({
  maxHeight: '512px',
  objectFit: 'contain',
  borderRadius: '10px',
});

const DownloadButton = styled(IconButton)({
  position: 'absolute',
  top: '12px',
  right: '16px',
  width: '51px',
  height: '51px',
  padding: '0 4px',
  cursor: `url(${pointingCursor}), pointer`,
  opacity: 0,
  transition: 'opacity 0.2s ease',
  '& img': {
    width: '51px',
    height: '43px',
    objectFit: 'contain',
  },
});

const ImageWrapper = styled(Box)({
  position: 'relative',
  '&:hover button': {  // 使用普通的 CSS 选择器
    opacity: 1,
  },
});

interface ImageDisplayContentProps {
  status: 'idle' | 'generating' | 'completed' | 'failed';
  generatedImageUrl?: string;
  generatedRatio?: AspectRatio;
}

const ImageDisplayContent: React.FC<ImageDisplayContentProps> = ({
  status,
  generatedImageUrl,
  generatedRatio
}) => {
  const currentModel = useSelector(selectCurrentModel);

  const handleDownload = async () => {
    if (!generatedImageUrl || !currentModel || !generatedRatio) return;
    
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentModel.name}_${generatedRatio.width}_${generatedRatio.height}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const calculateImageDimensions = (originalWidth: number, originalHeight: number) => {
    const maxHeight = 512;
    const aspectRatio = originalWidth / originalHeight;
    const height = Math.min(maxHeight, originalHeight);
    const width = height * aspectRatio;
    return { width, height };
  };

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
      if (!generatedImageUrl || !generatedRatio) return null;
      const dimensions = calculateImageDimensions(generatedRatio.width, generatedRatio.height);
      
      return (
        <GeneratedImageContainer>
          <ImageWrapper>
            <GeneratedImage 
              src={generatedImageUrl} 
              alt="Generated"
              style={{
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
              }}
            />
            <DownloadButton onClick={handleDownload}>
              <img src={gdownloadIcon} alt="Download" />
            </DownloadButton>
          </ImageWrapper>
        </GeneratedImageContainer>
      );
    case 'failed':
      return (
        <GeneratingContent>
          <GeneratingStatus>
            <GeneratingText>Image Generation Failed</GeneratingText>
          </GeneratingStatus>
        </GeneratingContent>
      );
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

const PromptInput = styled(Box)({
  width: '100%',
  height: '50px',
  display: 'flex',
  gap: '10px',
  border: '1px solid #4E318D',
});

const StyledInput = styled('input')<{ disabled?: boolean }>(({ disabled }) => ({
  flex: 1,
  height: '50px',
  padding: '0 25px',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid #4E318D',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '140%',
  color: '#FFFFFF',
  transition: 'border-color 0.2s ease',
  '&::placeholder': {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  '&:disabled': {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  '&:focus': {
    outline: 'none',
    borderColor: '#6B48BD',  // 选中时使用更亮的紫色
  },
}));

const GenerateButton = styled(Button)<{ disabled?: boolean }>(({ disabled }) => ({
  width: '190px',
  height: '50px',
  padding: '0 30px',
  background: disabled ? '#AAABB4' : 'linear-gradient(90deg, #C7FF8C 0%, #E8C4EA 43%, #39EDFF 100%)',
  borderRadius: '4px',
  border: 'none',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: '140%',
  cursor: disabled ? 'not-allowed' : `url(${pointingCursor}), pointer`,
  '&:hover': {
    background: disabled ? '#AAABB4' : 'linear-gradient(90deg, #C7FF8C 0%, #E8C4EA 43%, #39EDFF 100%)',
    opacity: disabled ? 1.0 : 0.9,
  },
  '&:active': {
    background: disabled ? '#AAABB4' : 'linear-gradient(90deg, #C7FF8C 0%, #E8C4EA 43%, #39EDFF 100%)',
    opacity: disabled ? 1.0 : 0.9,
  },
  '& .MuiButton-startIcon': {
    margin: 0,
    marginRight: '0px',
  },
}));

const ButtonIcon = styled('img')({
  width: '30px',
  height: '30px',
});

const GenerateText = styled(Typography)({
  color: '#000000',
  fontSize: '18px',
  fontWeight: 700,
  lineHeight: '24px',
});

const StrengthSlider = styled(Box)({
  width: '147px',
  height: '32px',
  borderRadius: '4px',
  border: '1px solid #4E318D',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  display: 'flex',
  alignItems: 'center',
  padding: '0 14px',
  gap: '14px',
  position: 'relative',
  cursor: `url(${cursor}), pointer`,
});

const SliderLabel = styled(Typography)({
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '140%',
  color: '#FFFFFF',
  userSelect: 'none',
  position: 'relative',
  zIndex: 1,
});

const SliderValue = styled(Typography)({
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '140%',
  color: '#C7FF8C',
  userSelect: 'none',
  position: 'relative',
  zIndex: 1,
});

const SliderTrack = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  backgroundColor: '#4E318D',
  borderRadius: '4px 0 0 4px',
  pointerEvents: 'none',
  zIndex: 0,  // 确保在文字下面
});

export default function GenerateModal() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isOpen = useSelector((state: RootState) => state.ui.isGenerateModalOpen);
  const currentModel = useSelector(selectCurrentModel);
  const walletAddress = useSelector((state: RootState) => state.wallet.address);
  const generatingStatus = useSelector(selectGeneratingStatus);
  const generatedImageUrl = useSelector(selectGeneratedImageUrl);
  const generatingTaskId = useSelector(selectGeneratingTaskId);
  const generatedRatio = useSelector(selectGeneratedRatio);
  
  // 所有需要重置的状态
  const [isRatioMenuOpen, setIsRatioMenuOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [strength, setStrength] = useState(0.5);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 监听 isOpen 变化，当模态框打开时重置所有状态
  useEffect(() => {
    if (isOpen) {
      dispatch(resetGeneration());
      // 重置所有状态到初始值
      setIsRatioMenuOpen(false);
      setSelectedRatio(aspectRatios[0]);
      setStrength(0.5);
      setPrompt('');
      setIsGenerating(false);
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (generatingTaskId && generatingStatus === 'generating') {
      intervalId = setInterval(() => {
        dispatch(checkGenerationStatus(generatingTaskId));
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [generatingTaskId, generatingStatus, dispatch]);

  const handleClose = useCallback(() => {
    document.body.style.overflow = '';
    dispatch(closeGenerateModal());
  }, [dispatch]);

  const handleRatioClick = (ratio: AspectRatio) => {
    setSelectedRatio(ratio);
    setIsRatioMenuOpen(false);  // 选择后关闭菜单
  };

  const handleSliderInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    let newStrength = Math.max(0, Math.min(1, x / width));
    newStrength = Math.round(newStrength * 100) / 100;
    
    setStrength(newStrength);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleSliderInteraction(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleSliderInteraction]);

  const handleGenerate = async () => {
    if (!prompt || generatingStatus === 'generating' || !currentModel || !walletAddress) return;

    dispatch(generateImage({
      model_id: currentModel.id,
      creator: walletAddress,
      prompt,
      version: currentModel.model_tran?.[0]?.version,
      strength,
      ratio: selectedRatio
    }));
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
            status={generatingStatus}
            generatedImageUrl={generatedImageUrl || undefined}
            generatedRatio={generatedRatio || undefined}
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
          <StrengthSlider
            ref={sliderRef}
            onClick={handleSliderInteraction}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
              handleSliderInteraction(e);
            }}
          >
            <SliderTrack 
              sx={{ 
                width: `${strength * 100}%`,
                transition: isDragging ? 'none' : 'width 0.1s ease-out'
              }} 
            />
            <SliderLabel>Strength:</SliderLabel>
            <SliderValue>{strength.toFixed(2)}</SliderValue>
          </StrengthSlider>
        </ParametersArea>
        <PromptInput>
          <StyledInput
            placeholder="Input Your Prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generatingStatus === 'generating'}
          />
          <GenerateButton
            startIcon={<ButtonIcon src={createIcon} alt="Create" />}
            disabled={!prompt || generatingStatus === 'generating'}
            onClick={handleGenerate}>
            <GenerateText>Generate</GenerateText>
          </GenerateButton>
        </PromptInput>
      </ContentContainer>
    </ModalOverlay>
  );
} 