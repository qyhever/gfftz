import { useMemo } from 'react'
import type { ExtendedRouteObject } from '@/types/route'

/**
 * 从路由配置中提取需要 KeepAlive 的路由信息
 */
export function useKeepAliveRoutes(routes: ExtendedRouteObject[]) {
  const keepAliveRoutes = useMemo(() => {
    const result: Array<{
      path: string
      Component: React.ComponentType
    }> = []

    function normalizePath(path: string): string {
      // 移除多余的斜杠，确保路径格式正确
      return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
    }

    function traverse(routes: ExtendedRouteObject[], parentPath = '') {
      routes.forEach((route) => {
        // 跳过没有实际路径内容的路由配置
        if (!route.path && !route.index) {
          // 只传递 parentPath 继续遍历子路由
          if (route.children) {
            traverse(route.children, parentPath)
          }
          return
        }

        // 构建当前路径
        let currentPath = parentPath

        if (route.path) {
          if (route.path === '/') {
            // 根路径特殊处理
            currentPath = parentPath || '/'
          } else if (route.path.startsWith('/')) {
            // 绝对路径
            currentPath = route.path
          } else {
            // 相对路径：拼接父路径
            const base = parentPath === '/' ? '' : parentPath
            currentPath = `${base}/${route.path}`
          }

          // 标准化路径
          currentPath = normalizePath(currentPath)

          // 如果配置了 keepAlive 且有 Component
          if (route.keepAlive && route.Component) {
            result.push({
              path: currentPath,
              Component: route.Component,
            })
          }
        }

        // 递归处理子路由
        if (route.children) {
          traverse(route.children, currentPath)
        }
      })
    }

    traverse(routes)

    return result
  }, [routes])

  return keepAliveRoutes
}
