import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router'
import App from './components/App'

const router = createBrowserRouter([{ path: '*', element: <App /> }])

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
