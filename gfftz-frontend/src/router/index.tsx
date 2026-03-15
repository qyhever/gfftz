import { createBrowserRouter } from 'react-router'
import type { RouteObject } from 'react-router'
import App from '../App'
import { routes } from './routes'
import type { ExtendedRouteObject } from '@/types/route'

const appRoutes = [
  {
    Component: App,
    children: routes,
  },
]

const convertedRoutes = convertToRouteObjects(appRoutes)

export const router = createBrowserRouter(convertedRoutes, {
  basename: '/gfftz/',
})

/**
 * 将 ExtendedRouteObject 转换为 RouteObject
 * 移除自定义属性（如 keepAlive），保留 React Router 标准属性
 */
function convertToRouteObjects(routes: ExtendedRouteObject[]): RouteObject[] {
  return routes.map((route) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { keepAlive, children, ...rest } = route

    // 使用类型断言，这里肯定是符合 RouteObject 的
    const routeObject = {
      ...rest,
      ...(children && { children: convertToRouteObjects(children) }),
    } as RouteObject

    return routeObject
  })
}
