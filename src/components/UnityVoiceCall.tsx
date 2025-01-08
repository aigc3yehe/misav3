import { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material';
import { Box } from '@mui/material';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loading.json';

// 添加 Loading 容器样式
const LoadingContainer = styled(Box)({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 128,
    height: 128,
  });

const UnityWrapper = styled('div')({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
});

const UnityCanvas = styled('canvas')({
  width: '100%',
  height: '100%',
  opacity: 0,
  transition: 'opacity 0.5s ease',
});

const UnityWarning = styled('div')({
  position: 'absolute',
  left: '50%',
  top: '5%',
  transform: 'translate(-50%)',
  zIndex: 10,
});

declare global {
  interface Window {
    unityVoiceInstance: any;
    UnityVoiceStartCallback: () => void;
    createUnityInstance: any;
  }
}

export default function UnityVoiceCall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const handleResize = () => {
    if (canvasRef.current) {
      canvasRef.current.style.width = '100%';
      canvasRef.current.style.height = '100%';
    }
  };

  const mapValue = (x: number, minIn: number, maxIn: number, minOut: number, maxOut: number) => {
    return (x - minIn) / (maxIn - minIn) * (maxOut - minOut) + minOut;
  };

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

  useEffect(() => {
    // Unity 启动回调
    window.UnityVoiceStartCallback = () => {
      if (starsRef.current) starsRef.current.style.opacity = '0';
      if (canvasRef.current) canvasRef.current.style.opacity = '1';
      setLoading(false);

      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      window.unityVoiceInstance.SendMessage('PlatformSystem', 'NotificationPlatform', mobile ? "0" : "1");
    };

    // 检查移动设备
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (mobile) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }

    // Unity 配置
    const buildUrl = "/Build";
    const config = {
      dataUrl: buildUrl + "/9d25a14b06c4bee9fffd0f1869321448.data.unityweb",
      frameworkUrl: buildUrl + "/7362a96327c1f85b86405fc85119e499.framework.js.unityweb",
      codeUrl: buildUrl + "/3e4e4e870d7dd483297335435378864d.wasm.unityweb",
      symbolsUrl: buildUrl + "/d33855a90934d0101c75cae1519c6e42.symbols.json.unityweb",
      streamingAssetsUrl: "StreamingAssets",
      companyName: "DefaultCompany",
      productName: "Human_Back",
      productVersion: "1.0",
      showBanner: unityShowBanner,
    };

    // 加载 Unity
    const script = document.createElement("script");
    script.src = `${buildUrl}/06834e7c111c802ccbefe6caa6ae044e.loader.js`;
    script.onload = () => {
      handleResize();

      window.createUnityInstance(canvasRef.current, config, (progress: number) => {
        const p = mapValue(progress, 0, 0.4, 0, 1);
        const normalizedProgress = Math.min(1, Math.max(0, p));
        // setLoadingProgress(normalizedProgress * 100);
        console.log('normalizedProgress', normalizedProgress);
      }).then((unityInstance: any) => {
        window.unityVoiceInstance = unityInstance;
        window.UnityVoiceStartCallback();
      }).catch((message: string) => {
        console.error('Unity 加载失败:', message);
        unityShowBanner(message, 'error');
      });
    };
    document.body.appendChild(script);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      // @ts-ignore
      window.UnityVoiceStartCallback = undefined;
    };
  }, []);

  return (
    <UnityWrapper>
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
    </UnityWrapper>
  );
} 