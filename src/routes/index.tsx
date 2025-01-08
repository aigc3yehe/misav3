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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/workstation" replace />,
      },
      {
        path: '/workstation',
        element: <Workstation />,
      },
      {
        path: '/models',
        element: <Models />,
      },
      {
        path: '/models/:id',
        element: <ModelDetail />,
      },
      {
        path: '/collections',
        element: <Collections />,
      },
      {
        path: '/collections/:id/nfts',
        element: <NFTGallery />,
      },
      {
        path: '/gallery',
        element: <Gallery />,
      },
      {
        path: '/voice_call',
        element: <VoiceCall />,
      },
      {
        path: '/visualize_x',
        element: <VisualizeX />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]); 