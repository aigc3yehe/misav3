import { Box, styled, IconButton, Typography } from '@mui/material';
import pointingCursor from '../assets/pointer.png';
import downloadIcon from '../assets/download.svg';
import generatingBg from '../assets/generating_image_bg.svg';
import { keyframes } from '@mui/system';

interface ImageCardProps {
  image_id: number;
  imageUrl: string;
  width: number;
  height: number;
  onClick: () => void;
  state?: number; // 0: generating, 1: completed
}

const Card = styled(Box)<{ height: number; isGenerating: boolean }>(({ height, isGenerating }) => ({
  width: '100%',
  height: isGenerating ? 212 : height,
  borderRadius: 10,
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '#000',
  cursor: `url(${pointingCursor}), pointer`,
  ...(isGenerating ? {
    backgroundImage: `url(${generatingBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {
    '&:hover': {
      '& img.main-image': {
        transform: 'scale(1.05)',
      },
      '& .overlay': {
        opacity: 1,
      },
    },
  }),
}));

const Image = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.3s ease',
});

const Overlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
});

const DownloadButton = styled(IconButton)({
  position: 'absolute',
  top: 8,
  right: 8,
  padding: 0,
  width: '40px',
  height: '40px',
  '& img': {
    width: '40px',
    height: '40px',
  },
});

const GeneratingContent = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
});

const bounce = keyframes`
  0%, 100% { 
    transform: translateY(0) scale(1);
  }
  50% { 
    transform: translateY(-5px) scale(1.5);
  }
`;

const LoadingDots = styled(Box)({
  display: 'flex',
  gap: '5px',
  alignItems: 'center',
  position: 'relative',
  height: '9px', // 确保容器高度足够
});

const Dot = styled(Box)<{ size?: number; delay?: number }>(({ delay = 0 }) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: '#D9D9D9',
  animation: `${bounce} 1s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const GeneratingText = styled(Typography)({
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: '100%',
  color: '#C7FF8C',
});

const ModelName = styled(Typography)({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '100%',
  color: 'rgba(255, 255, 255, 0.6)',
  whiteSpace: 'nowrap', // 防止文本换行
});

export default function ImageCard({ 
  image_id,
  imageUrl, 
  height, 
  onClick,
  state = 1 // 默认为完成状态
}: ImageCardProps) {
  
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，防止触发卡片的点击事件
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `image-${image_id}.png`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const isGenerating = state === 0;

  return (
    <Card height={height} onClick={onClick} isGenerating={isGenerating} id={`image-card-${image_id}`}>
      {isGenerating ? (
        <GeneratingContent>
          <LoadingDots>
            <Dot delay={0} />
            <Dot delay={0.2} />
            <Dot delay={0.4} />
          </LoadingDots>
          <GeneratingText>Generating...</GeneratingText>
          <ModelName>Ethereal Dreamscape</ModelName>
        </GeneratingContent>
      ) : (
        <>
          <Image className="main-image" src={imageUrl} alt="gallery" />
          <Overlay className="overlay">
            <DownloadButton onClick={handleDownload}>
              <img src={downloadIcon} alt="download" />
            </DownloadButton>
          </Overlay>
        </>
      )}
    </Card>
  );
} 