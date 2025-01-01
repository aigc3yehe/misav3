import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material';

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemWidth: number;
  itemHeight: number;
  gap: number;
  containerWidth: number;
  threshold?: number;
  onScroll?: (scrollInfo: { scrollTop: number; scrollHeight: number; clientHeight: number }) => void;
}

const GridContainer = styled('div')({
  position: 'relative',
});

const GridContent = styled('div')({
  position: 'relative',
});

function VirtualizedGrid<T>({
  items,
  renderItem,
  itemWidth,
  itemHeight,
  gap,
  containerWidth,
  threshold = 200,
  onScroll,
}: VirtualizedGridProps<T>) {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  // 添加滚动条宽度计算
  const container = document.getElementById('modelsContainer');
  const hasVerticalScrollbar = container ? container.scrollHeight > container.clientHeight : false;
  const SCROLLBAR_WIDTH = 17;
  const adjustedContainerWidth = containerWidth - (hasVerticalScrollbar ? SCROLLBAR_WIDTH : 0);

  // 使用调整后的容器宽度进行计算
  const itemsPerRow = Math.floor((adjustedContainerWidth + gap) / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const totalHeight = totalRows * (itemHeight + gap) - gap;

  // 修改计算逻辑
  const totalRowWidth = (itemWidth * itemsPerRow) + (gap * (itemsPerRow - 1));
  const sidePadding = (adjustedContainerWidth - totalRowWidth) / 2;

  useEffect(() => {
    const container = document.getElementById('modelsContainer');
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      
      // 计算可见区域的行范围
      const visibleStartRow = Math.floor(scrollTop / (itemHeight + gap));
      const visibleEndRow = Math.ceil((scrollTop + clientHeight) / (itemHeight + gap));
      
      // 添加缓冲区
      const bufferRows = 2;
      const startRow = Math.max(0, visibleStartRow - bufferRows);
      const endRow = Math.min(totalRows, visibleEndRow + bufferRows);
      
      const startIdx = startRow * itemsPerRow;
      const endIdx = Math.min(items.length, endRow * itemsPerRow);
      
      setStartIndex(startIdx);
      setVisibleItems(items.slice(startIdx, endIdx));

      // 检查最后一行是否填满
      const lastRowItemCount = items.length % itemsPerRow;
      const shouldLoadMore = lastRowItemCount > 0 && lastRowItemCount < itemsPerRow;
      
      // 如果最后一行未填满，或者接近底部，触发加载
      if (shouldLoadMore || scrollHeight - (scrollTop + clientHeight) < threshold) {
        onScroll?.({ scrollTop, scrollHeight, clientHeight });
      }
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [items, itemHeight, gap, itemsPerRow, totalRows, onScroll]);

  return (
    <GridContainer style={{ marginTop: '22px' }}>
      <GridContent style={{ height: totalHeight }}>
        <div style={{
          position: 'absolute',
          top: Math.floor(startIndex / itemsPerRow) * (itemHeight + gap),
          left: `${sidePadding}px`,
          display: 'grid',
          gridTemplateColumns: `repeat(${itemsPerRow}, ${itemWidth}px)`,
          gap: `${gap}px`,
        }}>
          {visibleItems.map(renderItem)}
        </div>
      </GridContent>
    </GridContainer>
  );
}

export default VirtualizedGrid;
