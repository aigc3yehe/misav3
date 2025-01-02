import { Box, IconButton, styled } from '@mui/material';
import { useState, useCallback, useRef, useMemo } from 'react';
import arrowBack from '../assets/ArrowBack.svg';
import arrowForward from '../assets/ArrowForward.svg';

interface ViewPagerProps {
  items: string[];
  initialIndex?: number;
  slidesPerView?: number;
  spacing?: number;
  loop?: boolean;
}

const ViewPagerContainer = styled(Box)({
  position: 'relative',
  width: '695px',
  height: '400px',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  userSelect: 'none',
});

const SlideContainer = styled(Box)({
  width: '100%',
  height: '100%',
  display: 'flex',
});

const Slide = styled(Box)<{ $spacing: number }>(({ $spacing }) => ({
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: `0 ${$spacing / 2}px`,
  '& img': {
    width: '341.5px',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '10px',
  },
}));

const NavigationButton = styled(IconButton)({
  position: 'absolute',
  padding: 0,
  width: '60px',
  height: '60px',
  zIndex: 1,
  '&:hover': {
    backgroundColor: 'transparent',
  },
});

const ArrowIcon = styled('img')({
  width: '60px',
  height: '60px',
});

export default function ImageViewPager({ 
  items, 
  initialIndex = 0,
  slidesPerView = 2,
  spacing = 12,
  loop = false,
}: ViewPagerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const slideWidth = 100 / slidesPerView;

  const displayItems = useMemo(() => {
    if (!loop) return items;
    return [
      ...items.slice(-slidesPerView),
      ...items,
      ...items.slice(0, slidesPerView)
    ];
  }, [items, loop, slidesPerView]);

  const handleTransitionEnd = () => {
    if (!loop) return;
    
    if (currentIndex <= -1) {
      setIsTransitioning(false);
      setCurrentIndex(items.length - 1);
    } else if (currentIndex >= items.length) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  };

  const handlePrevious = useCallback(() => {
    setIsTransitioning(true);
    if (loop) {
      setCurrentIndex(current => current - 1);
    } else {
      setCurrentIndex(current => (current > 0 ? current - 1 : current));
    }
  }, [loop]);

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    if (loop) {
      setCurrentIndex(current => current + 1);
    } else {
      setCurrentIndex(current => (
        current < items.length - slidesPerView ? current + 1 : current
      ));
    }
  }, [loop, items.length, slidesPerView]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollLeft(currentIndex);
    setIsTransitioning(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const x = e.pageX;
    const walk = (startX - x) / containerRef.current!.offsetWidth;
    const newIndex = scrollLeft + walk * slidesPerView;
    
    if (loop) {
      setCurrentIndex(newIndex);
    } else if (newIndex >= 0 && newIndex <= items.length - slidesPerView) {
      setCurrentIndex(newIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsTransitioning(true);
    
    let targetIndex = Math.round(currentIndex);
    if (!loop) {
      targetIndex = Math.max(0, Math.min(targetIndex, items.length - slidesPerView));
    }
    setCurrentIndex(targetIndex);
  };

  const getTranslateX = () => {
    if (!loop) return -currentIndex * slideWidth;
    return -(currentIndex + slidesPerView) * slideWidth;
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setScrollLeft(currentIndex);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const x = e.touches[0].clientX;
    const walk = (startX - x) / containerRef.current!.offsetWidth;
    const newIndex = scrollLeft + walk * slidesPerView;
    
    if (newIndex >= 0 && newIndex <= items.length - slidesPerView) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <ViewPagerContainer ref={containerRef}>
      <SlideContainer
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onTransitionEnd={handleTransitionEnd}
        sx={{
          transform: `translateX(${getTranslateX()}%)`,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isTransitioning ? 'transform 0.3s ease-in-out' : 'none',
        }}
      >
        {displayItems.map((item, index) => (
          <Slide 
            key={index}
            $spacing={spacing}
            sx={{ minWidth: `${slideWidth}%` }}
          >
            <img src={item} alt={`Slide ${index + 1}`} draggable={false} />
          </Slide>
        ))}
      </SlideContainer>

      {(loop || currentIndex > 0) && (
        <NavigationButton
          sx={{ left: '10px' }}
          onClick={handlePrevious}
        >
          <ArrowIcon src={arrowBack} alt="Previous" />
        </NavigationButton>
      )}

      {(loop || currentIndex < items.length - slidesPerView) && (
        <NavigationButton
          sx={{ right: '10px' }}
          onClick={handleNext}
        >
          <ArrowIcon src={arrowForward} alt="Next" />
        </NavigationButton>
      )}
    </ViewPagerContainer>
  );
}
