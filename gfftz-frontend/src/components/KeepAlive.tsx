import { Activity } from 'react'
import { useLocation, matchPath } from 'react-router'

interface KeepAliveProps {
  children: React.ReactNode
  /** 需要保持活跃的路由路径（支持通配符，如 /user/* ） */
  when: string | string[]
  /** 是否精确匹配路径 */
  exact?: boolean
}

/**
 * KeepAlive 组件 - 结合 React 19 Activity 和 React Router
 *
 * 用于在路由切换时保持组件状态不被销毁
 *
 * @example
 * // 单个路径
 * <KeepAlive when="/home">
 *   <Home />
 * </KeepAlive>
 *
 * @example
 * // 多个路径
 * <KeepAlive when={["/home", "/about"]}>
 *   <Component />
 * </KeepAlive>
 *
 * @example
 * // 通配符匹配
 * <KeepAlive when="/user/*">
 *   <UserLayout />
 * </KeepAlive>
 */
export const KeepAlive = ({ children, when, exact = false }: KeepAliveProps) => {
  const location = useLocation()

  const paths = Array.isArray(when) ? when : [when]
  const isActive = paths.some((path) => matchPath({ path, end: exact }, location.pathname))

  return <Activity mode={isActive ? 'visible' : 'hidden'}>{children}</Activity>
}
