import React, { useEffect, useState, useRef } from 'react';
import { styled } from '@mui/material';

interface WaterfallGridProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemWidth: number;
  itemHeight: (item: T) => number;
  gap: number;
  containerWidth: number;
  threshold?: number;
  onScroll?: (scrollInfo: { scrollTop: number; scrollHeight: number; clientHeight: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const GridContainer = styled('div')({
  position: 'relative',
});

const GridContent = styled('div')({
  position: 'relative',
});

const ItemWrapper = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
});

function WaterfallGrid<T>({
  items,
  renderItem,
  itemWidth,
  itemHeight,
  gap,
  containerWidth,
  threshold = 200,
  onScroll,
  containerRef,
}: WaterfallGridProps<T>) {
  const [visibleItems, setVisibleItems] = useState<Array<T & { position: { left: number; top: number } }>>([]);
  const [totalHeight, setTotalHeight] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const grid = gridRef.current;
    if (!container || !grid || containerWidth <= 0) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;
      
      // 计算网格容器相对于视口的位置
      const gridRect = grid.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const gridTop = gridRect.top - containerRect.top + scrollTop;
      
      // 确保至少有1列
      const itemsPerRow = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
      // console.log('Layout calculation:', { itemsPerRow, containerWidth, itemWidth, gap });

      const totalRowWidth = (itemWidth * itemsPerRow) + (gap * (itemsPerRow - 1));
      const sidePadding = Math.max(0, (containerWidth - totalRowWidth) / 2);

      // 初始化列高度数组
      const columnHeights = new Array(itemsPerRow).fill(0);
      
      // 计算所有项目的位置
      const itemPositions = items.map((item) => {
        const height = itemHeight(item);
        
        // 找到最短的列
        const minHeight = Math.min(...columnHeights);
        const columnIndex = columnHeights.indexOf(minHeight);
        
        // 计算位置
        const left = sidePadding + columnIndex * (itemWidth + gap);
        const top = columnHeights[columnIndex];
        
        // 更新列高度
        columnHeights[columnIndex] = top + height + gap;
        
        return {
          ...item,
          position: { left, top }
        };
      });

      // 更新总高度
      const maxHeight = Math.max(...columnHeights);
      setTotalHeight(maxHeight > 0 ? maxHeight - gap : 0);

      // 调整 scrollHeight 的计算，使用网格的实际高度
      const adjustedScrollHeight = gridTop + maxHeight;
      //console.log('scrollHeight', adjustedScrollHeight);
      //console.log('clientHeight', clientHeight);
      //console.log('scrollTop', scrollTop);
      //console.log('threshold', threshold);
      
      // 使用调整后的 scrollHeight 检查是否需要加载更多
      if (adjustedScrollHeight > 0 && 
          clientHeight > 0 && 
          adjustedScrollHeight - (scrollTop + clientHeight) < threshold) {
        //console.log('Triggering load more...');
        onScroll?.({ 
          scrollTop, 
          scrollHeight: adjustedScrollHeight, 
          clientHeight 
        });
      }

      setVisibleItems(itemPositions.filter(
        item => item.position.top >= 0 && item.position.top <= adjustedScrollHeight
      ));
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [items, itemHeight, gap, containerWidth, threshold, onScroll, itemWidth, containerRef]);

  return (
    <GridContainer ref={gridRef}>
      <GridContent style={{ height: totalHeight }}>
        {visibleItems.map((item, index) => (
          <ItemWrapper
            key={index}
            style={{
              transform: `translate(${item.position.left}px, ${item.position.top}px)`,
              width: itemWidth,
            }}
          >
            {renderItem(item)}
          </ItemWrapper>
        ))}
      </GridContent>
    </GridContainer>
  );
}

export default WaterfallGrid; 