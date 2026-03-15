import type { MenuProps } from 'antd'
import type { ExtendedRouteObject } from '@/types/route'
import type { IUserInfo } from '@/types/global'
import type { ExtendedMenuItem } from './menu'

type MenuItem = Required<MenuProps>['items'][number]

/**
 * 根据路由路径获取需要展开的父菜单 keys
 * 会返回路径中所有的父级路径，用于自动展开多级菜单
 * 例如：/forms/linkage/antd -> ['/forms', '/forms/linkage']
 */
export function getOpenKeysFromPath(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean)
  const openKeys: string[] = []

  // 遍历路径片段，逐步构建父级路径
  // 只需要构建到倒数第二层，因为最后一层是选中的菜单项（不需要作为 openKey）
  let currentPath = ''
  for (let i = 0; i < parts.length - 1; i++) {
    currentPath += '/' + parts[i]
    openKeys.push(currentPath)
  }

  return openKeys
}

/**
 * 从路由表中查找指定路径的路由配置
 */
export function findRouteByPath(
  pathname: string,
  routes: ExtendedRouteObject[],
): ExtendedRouteObject | undefined {
  for (const route of routes) {
    // 匹配当前路由
    if (route.path === pathname) {
      return route
    }

    // 递归查找子路由
    if (route.children) {
      const found = findRouteByPath(pathname, route.children)
      if (found) return found
    }
  }

  return undefined
}

/**
 * 检查菜单中是否存在指定的 key
 */
export function menuKeyExists(key: string, menuItems: MenuItem[]): boolean {
  for (const item of menuItems) {
    if (item && typeof item === 'object' && 'key' in item) {
      if (item.key === key) return true

      // 递归检查子菜单
      if ('children' in item && Array.isArray(item.children)) {
        if (menuKeyExists(key, item.children)) return true
      }
    }
  }

  return false
}

/**
 * 根据用户权限过滤菜单
 */
export function filterMenuByPermission(
  menuItems: ExtendedMenuItem[],
  userInfo: IUserInfo | null,
): MenuItem[] {
  if (!userInfo) {
    return []
  }

  const userResourceCodes = new Set(userInfo.resources.map((r) => r.code))

  const filterMenu = (items: ExtendedMenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        // 没有配置 resourceCode，表示不需要权限，直接显示
        if (!item.resourceCode) {
          return true
        }
        // 检查用户是否有该资源权限
        return userResourceCodes.has(item.resourceCode)
      })
      .map((item) => {
        // 移除 resourceCode 属性，避免传递到 DOM
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { resourceCode, ...itemWithoutResourceCode } = item

        // 如果有子菜单，递归过滤
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterMenu(item.children)
          // 如果过滤后子菜单为空，且父菜单需要权限但用户没有，则不显示
          if (filteredChildren.length === 0) {
            return null
          }
          return {
            ...itemWithoutResourceCode,
            children: filteredChildren,
          } as MenuItem
        }
        return itemWithoutResourceCode as MenuItem
      })
      .filter((item): item is MenuItem => item !== null)
  }

  return filterMenu(menuItems)
}

/**
 * 根据当前路径智能计算应该选中的菜单项
 * 1. 优先使用路由配置中的 menuKey
 * 2. 如果没有配置，则自动匹配父路径
 */
export function getSelectedMenuKey(
  pathname: string,
  routes: ExtendedRouteObject[],
  menuItems: MenuItem[],
): string {
  // 1. 优先从路由配置中查找 menuKey
  const currentRoute = findRouteByPath(pathname, routes)
  if (currentRoute?.menuKey) {
    return currentRoute.menuKey
  }

  // 2. 如果没有配置，则自动计算
  const pathSegments = pathname.split('/').filter(Boolean)

  // 先尝试完整路径
  if (menuKeyExists(pathname, menuItems)) {
    return pathname
  }

  // 逐级向上查找存在的菜单项
  for (let i = pathSegments.length - 1; i > 0; i--) {
    const parentPath = '/' + pathSegments.slice(0, i).join('/')
    if (menuKeyExists(parentPath, menuItems)) {
      return parentPath
    }
  }

  // 如果都没找到，返回原路径
  return pathname
}
