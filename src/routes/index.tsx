import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LivingRoom from '../pages/LivingRoom';
import Models from '../pages/Models';
import Gallery from '../pages/Gallery';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <LivingRoom />,
      },
      {
        path: '/living-room',
        element: <LivingRoom />,
      },
      {
        path: '/models',
        element: <Models />,
      },
      {
        path: '/gallery',
        element: <Gallery />,
      },
    ],
  },
]); 