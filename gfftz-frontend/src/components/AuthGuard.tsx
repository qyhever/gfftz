import { useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Spin } from 'antd'
import { useUserStore } from '@/stores/user'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, userInfo, fetchUserInfo } = useUserStore()

  // 计算是否需要加载用户信息
  const needsFetchUserInfo = useMemo(() => {
    return isLoggedIn && !userInfo
  }, [isLoggedIn, userInfo])

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin', { replace: true, state: { from: location } })
      return
    }

    // 已登录但 userInfo 未加载，先加载用户信息
    if (needsFetchUserInfo) {
      fetchUserInfo().catch((error) => {
        console.error('Failed to fetch user info:', error)
        // Token 失效，跳转到登录页
        // useUserStore.getState().logout()
        // navigate('/signin', { replace: true, state: { from: location } })
      })
    }
  }, [isLoggedIn, needsFetchUserInfo, navigate, fetchUserInfo, location])

  // 未登录，不渲染
  if (!isLoggedIn) {
    return null
  }

  // 正在加载用户信息，显示加载状态
  if (needsFetchUserInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  return <>{children}</>
}
