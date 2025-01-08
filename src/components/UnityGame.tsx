import { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material';
import { Box } from '@mui/material';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loading.json';

// 添加 Loading 容器样式
const LoadingContainer = styled(Box)({
    position: 'absolute',
    top: '25%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 128,
    height: 128,
  });

// 样式定义
const UnityWrapper = styled('div')({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
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
        //setLoadingProgress(progress * 100);
        console.log('progress', progress);
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
          <LoadingContainer>
            <Lottie 
              animationData={loadingAnimation}
              loop={true}
              autoplay={true}
            />
          </LoadingContainer>
        )}
        <UnityCanvas id="unity-canvas" ref={canvasRef} />
        <UnityWarning id="unity-warning" />
        <div id="unity-footer" />
      </UnityContainer>
    </UnityWrapper>
  );
} 