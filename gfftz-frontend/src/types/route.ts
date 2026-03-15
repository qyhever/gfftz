import type { RouteObject } from 'react-router'

/**
 * 扩展的路由配置类型
 */
export interface ExtendedRouteObject extends Omit<RouteObject, 'children'> {
  /** 是否保持组件状态（启用 KeepAlive） */
  keepAlive?: boolean
  /** 指定该路由应该激活的菜单项 key（可选,不配置则自动根据路径匹配父菜单） */
  menuKey?: string
  /** 权限资源码（用于权限校验,不配置表示无需权限） */
  resourceCode?: string
  /** 子路由 */
  children?: ExtendedRouteObject[]
}
