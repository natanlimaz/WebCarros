import React from 'react'
import ReactDOM from 'react-dom/client'
import { router } from './App.tsx'
import './index.css'

import { RouterProvider } from 'react-router-dom'
import AuthProvider from './contexts/AuthContext.tsx';

import { register } from 'swiper/element/bundle'

register();
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster
        position="top-right"
        reverseOrder={false}

        toastOptions={{
          success: {
            style: {
              backgroundColor: "#ef4444",
              color: "#FFF",
              fontWeight: "bold"
            }
          },
          error: {
            style: {
              background: "#ef4444",
              color: "#FFF",
              fontWeight: "bold"
            }
          }
        }}
    />
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </React.StrictMode>,
)
