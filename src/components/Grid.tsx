import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material';

interface GridProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemWidth: number;
  itemHeight: number;
  gap: number;
  containerWidth: number;
  containerId?: string;
  onScroll?: (scrollInfo: { scrollTop: number; scrollHeight: number; clientHeight: number }) => void;
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

function Grid<T>({
  items,
  renderItem,
  itemWidth,
  itemHeight,
  gap,
  containerWidth,
  containerId = 'modelsContainer',
  onScroll,
}: GridProps<T>) {
  const [visibleItems, setVisibleItems] = useState<Array<T & { position: { left: number; top: number } }>>([]);
  const [totalHeight, setTotalHeight] = useState(0);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || containerWidth <= 0) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;
      
      // 计算每行可以放置的项目数
      const itemsPerRow = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
      
      // 计算总行宽并居中
      const totalRowWidth = (itemWidth * itemsPerRow) + (gap * (itemsPerRow - 1));
      const sidePadding = Math.max(0, (containerWidth - totalRowWidth) / 2);

      // 计算总行数
      const totalRows = Math.ceil(items.length / itemsPerRow);
      
      // 计算所有项目的位置
      const itemPositions = items.map((item, index) => {
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;
        
        return {
          ...item,
          position: {
            left: sidePadding + col * (itemWidth + gap),
            top: row * (itemHeight + gap)
          }
        };
      });

      // 更新总高度
      const maxHeight = totalRows * (itemHeight + gap) - gap;
      setTotalHeight(maxHeight);

      // 通知滚动事件
      onScroll?.({ 
        scrollTop, 
        scrollHeight: maxHeight, 
        clientHeight 
      });

      // 设置可见项目
      setVisibleItems(itemPositions);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [items, itemHeight, gap, containerWidth, onScroll, itemWidth, containerId]);

  return (
    <GridContainer>
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

export default Grid; 