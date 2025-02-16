import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Workstation from '../pages/Workstation';
import Models from '../pages/Models';
import ModelDetail from '../pages/ModelDetail';
import Gallery from '../pages/Gallery';
import Collections from '../pages/Collections';
import NFTGallery from '../pages/Collections/NFTGallery';
import VoiceCall from '../pages/VoiceCall';
import VisualizeX from '../pages/VisualizeX';
import NotFound from '../pages/NotFound';
import MyNFTs from '../pages/MyNFTs';
import MySpace from '../pages/MySpace';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/workstation?agent=misato" replace />,
      },
      {
        path: '/workstation',
        element: <WorkstationProtectedRoute><Workstation /></WorkstationProtectedRoute>,
      },
      {
        path: '/models',
        element: <NiyokoProtectedRoute><Models /></NiyokoProtectedRoute>,
      },
      {
        path: '/models/:id',
        element: <NiyokoProtectedRoute><ModelDetail /></NiyokoProtectedRoute>,
      },
      {
        path: '/collections',
        element: <MisatoProtectedRoute><Collections /></MisatoProtectedRoute>,
      },
      {
        path: '/collections/:id/nfts',
        element: <MisatoProtectedRoute><NFTGallery /></MisatoProtectedRoute>,
      },
      {
        path: '/gallery',
        element: <NiyokoProtectedRoute><Gallery /></NiyokoProtectedRoute>,
      },
      {
        path: '/voice_call',
        element: <MisatoProtectedRoute><VoiceCall /></MisatoProtectedRoute>,
      },
      {
        path: '/visualize_x',
        element: <MisatoProtectedRoute><VisualizeX /></MisatoProtectedRoute>,
      },
      {
        path: '/my-nfts',
        element: <MisatoProtectedRoute><MyNFTs /></MisatoProtectedRoute>,
      },
      {
        path: '/my-space',
        element: <NiyokoProtectedRoute><MySpace /></NiyokoProtectedRoute>,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

// 添加 ProtectedRoute 组件
interface ProtectedRouteProps {
  children: React.ReactElement;
}

function NiyokoProtectedRoute({ children }: ProtectedRouteProps) {
  const currentAgent = useSelector((state: RootState) => state.agent.currentAgent);
  const { isWhitelisted } = useSelector((state: RootState) => state.wallet);
  
  if (!isWhitelisted) {
    // 如果尝试访问 niyoko 相关页面但不在白名单中，重定向到 misato
    return <Navigate to="/workstation?agent=misato" replace />;
  }
  
  if (currentAgent?.id !== 'niyoko') {
    return <Navigate to="/workstation?agent=misato" replace />;
  }

  return children;
} 

function MisatoProtectedRoute({ children }: ProtectedRouteProps) {
  const currentAgent = useSelector((state: RootState) => state.agent.currentAgent);
  
  if (currentAgent?.id !== 'misato') {
    return <Navigate to="/workstation?agent=niyoko" replace />;
  }

  return children;
}

function WorkstationProtectedRoute({ children }: ProtectedRouteProps) {
  const currentAgent = useSelector((state: RootState) => state.agent.currentAgent);
  const { isWhitelisted } = useSelector((state: RootState) => state.wallet);
  
  if (currentAgent?.id === 'niyoko' && !isWhitelisted) {
    return <Navigate to="/workstation?agent=misato" replace />;
  }

  return children;
}