import { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material';
import { Box } from '@mui/material';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loading.json';
import { useTheme, useMediaQuery } from '@mui/material';

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
  const hasLoadedRef = useRef(false);
  const theme = useTheme();
  // @ts-ignore
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dontCheckMobile = true;

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

    let mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (dontCheckMobile) {
      mobile = false;
    }
    window.unityInstance.SendMessage('PlatformSystem', 'NotificationPlatform', mobile ? "0" : "1");
  };

  const Call = () => {
    window.unityInstance.SendMessage('JSCall', 'AddVoice', 
      '{"content": "Hi, welcome back to MAVAE Studio!","finish": true}'
    );
  };

  useEffect(() => {
    console.log('check load unity:', !hasLoadedRef.current);
    
    if (hasLoadedRef.current) {
      console.log('Unity already loaded, skip load');
      return;
    }
    
    hasLoadedRef.current = true;
    console.log('start load unity');

    // 设置全局回调
    window.UnityStartCallback = UnityStartCallback;
    
    // 检查移动设备
    let mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (dontCheckMobile) {
      mobile = false;
    }
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
      dataUrl: `${buildUrl}/b3a6e2d0fcf38b515144e6cb686fa0e3.data.br`,
      frameworkUrl: `${buildUrl}/79c44ca5710802631019722ec90e3f79.framework.js.br`,
      codeUrl: `${buildUrl}/6616815c221de3d9b788abae0bb965c8.wasm.br`,
      streamingAssetsUrl: "StreamingAssets",
      companyName: "yehe",
      productName: "MAVAE",
      productVersion: "1.2",
      showBanner: unityShowBanner,
    };

    // 加载 Unity
    const script = document.createElement("script");
    script.src = `${buildUrl}/eebc1586e57de8622031503e80dcf696.loader.js`;
    script.onload = async () => {
      console.log('load script');
      try {
        const unityInstance = await window.createUnityInstance(canvasRef.current, config, (progress: number) => {
          progress += 0.7;
          progress = Math.min(1, Math.max(0, progress));
          //setLoadingProgress(progress * 100);
          if (progress >= 1) {
            console.log('progress', progress);
          }
        })
        console.log('instance load success', unityInstance)
        window.unityInstance = unityInstance;
        UnityStartCallback(unityInstance);
        setTimeout(Call, 2000);
      } catch (error) {
        console.error('Unity error:', error);
        unityShowBanner('Unity error', 'error');
      }
    };
    document.body.appendChild(script);

    // 清理
    return () => {
      console.log('clear', window.unityInstance);
      // @ts-ignore
      window.UnityStartCallback = undefined;
      window.removeEventListener('resize', handleResize);
      hasLoadedRef.current = false;
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