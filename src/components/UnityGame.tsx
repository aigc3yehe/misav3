import { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material';

// 样式定义
const UnityWrapper = styled('div')({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  background: '#FBF7F1',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    /* backgroundImage: 'url("/assets/icons/bg.svg")',
    backgroundRepeat: 'repeat',
    backgroundPosition: 'top center',
    backgroundSize: 'contain', */
    backgroundColor: '#FBF7F1',
    opacity: 1,
    zIndex: 1,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  '&.loading-complete::before': {
    opacity: 0,
  }
});

const UnityContainer = styled('div')({
  width: '100%',
  height: '100%',
  position: 'relative',
});

const UnityCanvas = styled('canvas')({
  width: '100%',
  height: '100%',
  background: 'transparent',
  opacity: 0,
  imageRendering: '-webkit-optimize-contrast',
  WebkitFontSmoothing: 'antialiased',
});

const LoadingBar = styled('div')({
  position: 'absolute',
  left: '50%',
  top: 'calc(50% - max(27vh, 231px))',
  transform: 'translate(-50%, -50%)',
  width: '240px',
  height: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  border: '1px solid var(--brand-primary)',
  borderRadius: '2px',
  zIndex: 10,
});

const ProgressBar = styled('div')({
  position: 'absolute',
  left: 0,
  top: 0,
  height: '100%',
  backgroundColor: 'var(--brand-primary)',
  borderRadius: '1px',
  transition: 'width 400ms ease-out',
});

const LoadingText = styled('p')({
  position: 'absolute',
  width: '100%',
  top: '10px',
  textAlign: 'center',
  fontFamily: "'04b03', monospace",
  fontSize: '14px',
  color: 'var(--brand-primary)',
  textShadow: '0 0 2px rgba(251, 89, 245, 0.3)',
});

const UnityWarning = styled('div')({
  position: 'absolute',
  left: '50%',
  top: '5%',
  transform: 'translate(-50%)',
  background: 'white',
  padding: '10px',
  display: 'none',
  zIndex: 10,
});

declare global {
  interface Window {
    unityInstance: any;
    UnityStartCallback: (instance: any) => void;
    createUnityInstance: any;
  }
}

export default function UnityGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const unityShowBanner = (msg: string, type: 'error' | 'warning') => {
    const warningBanner = document.querySelector("#unity-warning");
    if (!warningBanner) return;
    
    const div = document.createElement('div');
    div.innerHTML = msg;
    
    if (type === 'error') {
      div.style.cssText = 'background: red; padding: 10px;';
    } else {
      div.style.cssText = 'background: yellow; padding: 10px;';
      setTimeout(() => {
        warningBanner.removeChild(div);
      }, 5000);
    }
    
    warningBanner.appendChild(div);
  };

  const handleResize = () => {
    if (canvasRef.current) {
      canvasRef.current.style.width = '100%';
      canvasRef.current.style.height = '100%';
    }
  };

  // @ts-ignore
  const UnityStartCallback = (instance: any) => {
    setLoading(false);
    if (loadingBarRef.current) loadingBarRef.current.style.opacity = '0';
    if (canvasRef.current) canvasRef.current.style.opacity = '1';
    if (wrapperRef.current) {
      wrapperRef.current.classList.add('loading-complete');
    }

    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    window.unityInstance.SendMessage('PlatformSystem', 'NotificationPlatform', mobile ? "0" : "1");
  };

  const Call = () => {
    window.unityInstance.SendMessage('JSCall', 'AddVoice', 
      '{"content": "Hi, welcome back to MISATO Studio!","finish": true}'
    );
  };

  useEffect(() => {
    // 设置全局回调
    window.UnityStartCallback = UnityStartCallback;
    
    // 检查移动设备
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (mobile) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
      document.getElementsByTagName('head')[0].appendChild(meta);
      
      const container = document.querySelector("#unity-container");
      if (container) container.className = "unity-mobile";
      if (canvasRef.current) canvasRef.current.className = "unity-mobile";
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    // Unity 配置
    const buildUrl = "/Build";
    const config = {
      dataUrl: `${buildUrl}/9de9924fca3fc7495af7f9a101b5bb10.data.br`,
      frameworkUrl: `${buildUrl}/79c44ca5710802631019722ec90e3f79.framework.js.br`,
      codeUrl: `${buildUrl}/4a8035227a562073c1103fbff248961f.wasm.br`,
      streamingAssetsUrl: "StreamingAssets",
      companyName: "yehe",
      productName: "Misato",
      productVersion: "1.2",
      showBanner: unityShowBanner,
    };

    // 加载 Unity
    const script = document.createElement("script");
    script.src = `${buildUrl}/5c09bbd46ad23ae29a5b18429885c23b.loader.js`;
    script.onload = () => {
      window.createUnityInstance(canvasRef.current, config, (progress: number) => {
        progress += 0.7;
        progress = Math.min(1, Math.max(0, progress));
        setLoadingProgress(progress * 100);
      }).then((unityInstance: any) => {
        window.unityInstance = unityInstance;
        UnityStartCallback(unityInstance);
        setTimeout(Call, 2000);
      }).catch((message: string) => {
        console.error('Unity 加载失败:', message);
        unityShowBanner(message, 'error');
      });
    };
    document.body.appendChild(script);

    // 清理
    return () => {
      // @ts-ignore
      window.UnityStartCallback = undefined;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <UnityWrapper ref={wrapperRef}>
      <UnityContainer id="unity-container">
        {loading && (
          <LoadingBar ref={loadingBarRef}>
            <ProgressBar style={{ width: `${loadingProgress}%` }} />
            <LoadingText>
              Loading: {loadingProgress.toFixed(2)}%
            </LoadingText>
          </LoadingBar>
        )}
        <UnityCanvas id="unity-canvas" ref={canvasRef} />
        <UnityWarning id="unity-warning" />
        <div id="unity-footer" />
      </UnityContainer>
    </UnityWrapper>
  );
} 