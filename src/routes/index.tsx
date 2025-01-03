import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Workstation from '../pages/Workstation/index';
import Models from '../pages/Models';
import ModelDetail from '../pages/ModelDetail';
import Gallery from '../pages/Gallery';
import LandingPage from '../pages/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app',
    element: <MainLayout />,
    children: [
      {
        path: '/app/workstation',
        element: <Workstation />,
      },
      {
        path: '/app/models',
        element: <Models />,
      },
      {
        path: '/app/models/:id',
        element: <ModelDetail />,
      },
      {
        path: '/app/gallery',
        element: <Gallery />,
      },
    ],
  },
]); 