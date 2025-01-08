import { useState, useMemo } from 'react';
import { marked } from 'marked';
import { Box, styled } from '@mui/material';
import ImagePreview from './ImagePreview';

const MarkdownContainer = styled(Box)({
  fontSize: 14,
  lineHeight: '140%',
  fontWeight: 400,
  color: '#22116E',
  maxWidth: '100%',
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
  
  '& p': {
    margin: 0,
  },
  
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    margin: 0,
  },
  
  '& img': {
    width: 168,
    height: 'auto',
    borderRadius: 0,
    cursor: 'zoom-in',
    transition: 'transform 0.2s ease',
    display: 'block',
    
    '&:hover': {
      transform: 'scale(1.02)'
    }
  }
});

interface MDRendererProps {
  content: string;
}

export default function MDRenderer({ content }: MDRendererProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const imgSrc = (target as HTMLImageElement).src;
      if (imgSrc) {
        event.preventDefault();
        event.stopPropagation();
        setPreviewImage(imgSrc);
      }
    }
  };

  const renderedContent = useMemo(() => {
    if (content === '' || content === null || content === undefined) {
      return '';
    }
    return marked(content.trim().replace(/\s+/g, ' '));
  }, [content]);

  return (
    <>
      <MarkdownContainer 
        onClick={handleClick}
        // @ts-ignore
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
      <ImagePreview 
        open={!!previewImage}
        src={previewImage || ''}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
} 