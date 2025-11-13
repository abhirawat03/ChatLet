import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { Navigate } from 'react-router-dom'
// import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from './components/Layouts/MainLayout.jsx'
import ChatLayout from './components/Layouts/ChatLayout.jsx'
import DefaultPage from './components/ui/DefaultPage.jsx'
import SearchLayout from './components/Layouts/SearchLayout.jsx'
import ChatRoom from './components/ui/ChatRoom.jsx'
import Profile from './components/pages/Profile.jsx'
// import store from "./store.js"
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx'
import Login from './components/pages/Login.jsx'
import AuthPage from './components/pages/AuthPage.jsx'
import Signup from './components/pages/Signup.jsx'
import PresenceProvider from './components/Realtime/PresenceProvider.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children:[
      { path: '/auth', 
        element: <AuthPage/>,
        children:[
          {index:true, element:<Login/>},
          {path: "signup", element:<Signup/>}
        ]
      },
      {
        path:'',
        element:(
          <ProtectedRoute>
            <PresenceProvider>
              <MainLayout/>
            </PresenceProvider>
          </ProtectedRoute>
        ) ,
        children:[
          { index: true, element: <Navigate to="/chats" replace /> },
          {
            path: "chats",
            element: <ChatLayout />,
            children: [
              { index: true, element: <DefaultPage text="Select a chat" /> },
              // { path:":chatid", element: <ChatRoom /> },
              { path: "chat/:chat_id", element: <ChatRoom /> },
              { path: "profile/:username", element: <Profile /> },
            ],
          },
          {
            path: "search",
            element: <SearchLayout />,
            children: [
              { index: true, element: <DefaultPage text="Select a profile" /> },
              { path: "profile/:username", element: <Profile /> },
            ],
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <>
    {/* <Provider store={store}> */}
      {/* <PresenceProvider> */}
      <RouterProvider router={router}/>
{/* +     </PresenceProvider> */}
    {/* </Provider> */}
  </>
)
