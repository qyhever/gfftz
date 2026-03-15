import { Navigate, useLocation } from 'react-router'
import { Spin } from 'antd'
import { useUserStore } from '@/stores/user'
import { hasRoutePermission } from '@/utils/permission'
import { routes } from '@/router/routes'

interface IProps {
  children: React.ReactNode
}

/**
 * 权限守卫组件
 * 检查用户是否有访问当前路由的权限
 */
export const PermissionGuard: React.FC<IProps> = ({ children }) => {
  const location = useLocation()
  const userStore = useUserStore()

  // 用户信息还未加载完成，显示加载状态
  if (!userStore.userInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  // 提取实际路由路径（去除前导的 '/'）
  const pathname = location.pathname.startsWith('/')
    ? location.pathname.slice(1)
    : location.pathname

  // 检查权限
  const hasPermission = hasRoutePermission(userStore.userInfo, pathname, routes)

  // 没有权限，跳转到无权限页面
  if (!hasPermission) {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}
