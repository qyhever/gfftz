import type { IUserInfo } from '@/types/global'
import type { ExtendedRouteObject } from '@/types/route'

/**
 * 检查用户是否有指定资源权限
 */
export function hasResourcePermission(userInfo: IUserInfo | null, resourceCode?: string): boolean {
  // 没有配置 resourceCode，表示不需要权限
  if (!resourceCode) {
    return true
  }

  // 用户未登录或信息未加载
  if (!userInfo) {
    return false
  }

  // 检查用户的 resources 中是否包含该资源码
  return userInfo.resources.some((resource) => resource.code === resourceCode)
}

/**
 * 检查用户是否有访问指定路由的权限
 */
export function hasRoutePermission(
  userInfo: IUserInfo | null,
  pathname: string,
  routes: ExtendedRouteObject[],
): boolean {
  // 用户信息未加载，暂时拒绝访问（等待加载完成后再判断）
  if (!userInfo) {
    return false
  }

  const route = findRouteByPath(pathname, routes)

  // 找不到路由配置或没有配置 resourceCode，表示不需要权限
  if (!route || !route.resourceCode) {
    return true
  }

  return hasResourcePermission(userInfo, route.resourceCode)
}

/**
 * 从路由表中查找指定路径的路由配置
 */
function findRouteByPath(
  pathname: string,
  routes: ExtendedRouteObject[],
): ExtendedRouteObject | undefined {
  for (const route of routes) {
    if (route.path === pathname) {
      return route
    }

    if (route.children) {
      const found = findRouteByPath(pathname, route.children)
      if (found) return found
    }
  }

  return undefined
}

/**
 * 获取用户所有可访问的资源码集合
 */
export function getUserResourceCodes(userInfo: IUserInfo | null): Set<string> {
  if (!userInfo) {
    return new Set()
  }
  return new Set(userInfo.resources.map((resource) => resource.code))
}
