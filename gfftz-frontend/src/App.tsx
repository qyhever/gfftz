import { useEffect, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { App as AntdApp, ConfigProvider } from 'antd'
import locale from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  VersionUpdateNotification,
  type VersionUpdateNotificationRef,
} from './components/VersionUpdateNotification'

import 'dayjs/locale/zh-cn'

import './styles/index.css'
import './styles/tailwind.css'
import { Toaster } from '@/components/ui/sonner'
import { setNavigate } from './utils/navigate'
import { versionChecker } from './utils/version-checker'

dayjs.locale('zh-cn')

const queryClient = new QueryClient()

function App() {
  const navigate = useNavigate()
  const versionNotificationRef = useRef<VersionUpdateNotificationRef>(null)

  useEffect(() => {
    // 启动版本检测
    if (import.meta.env.VITE_APP_MODE_ENV !== 'dev') {
      versionChecker.start((info) => {
        console.log('检测到新版本:', info)
        versionNotificationRef.current?.open(info)
      })
    }
    return () => {
      // 停止版本检测
      versionChecker.stop()
    }
  }, [])

  useEffect(() => {
    // 初始化全局 navigate 实例
    setNavigate(navigate)
  }, [navigate])

  return (
    <QueryClientProvider client={queryClient}>
      <AntdApp>
        <ConfigProvider locale={locale}>
          <Toaster position="top-center" richColors expand />
          <Outlet />
        </ConfigProvider>
      </AntdApp>
      <VersionUpdateNotification ref={versionNotificationRef} />
    </QueryClientProvider>
  )
}

export default App
