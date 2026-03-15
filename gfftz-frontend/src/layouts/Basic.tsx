import { Activity, useState, useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { TextAlignJustify, LogOut, ChevronDown } from 'lucide-react'
import type { MenuProps } from 'antd'
import { Menu, Button, Layout, Dropdown, App } from 'antd'
import { cn } from '@/lib/utils'
import styles from './index.module.css'
import logoImg from '@/assets/logo.svg'
// import SimpleBar from 'simplebar-react'
// import 'simplebar-react/dist/simplebar.min.css'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useKeepAliveRoutes } from '@/hooks/useKeepAliveRoutes'
import { routes } from '@/router/routes'
import { menuList } from './menu'
import { getOpenKeysFromPath, getSelectedMenuKey, filterMenuByPermission } from './utils'
import { PermissionGuard } from '@/components/PermissionGuard'
import { ComImage } from '@/components/ComImage'

const { Sider } = Layout

const Basic: React.FC = () => {
  const appStore = useAppStore()
  const userStore = useUserStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { message } = App.useApp()

  // 获取需要 KeepAlive 的路由列表
  const keepAliveRoutes = useKeepAliveRoutes(routes)

  // 已访问的路由
  const [visitedRoutes, setVisitedRoutes] = useState<Set<string>>(new Set())

  // 判断当前路由是否是 KeepAlive 路由
  const currentKeepAliveRoute = keepAliveRoutes.find((route) => route.path === location.pathname)
  const isKeepAliveRoute = !!currentKeepAliveRoute

  // 根据用户权限过滤菜单
  const filteredMenuList = useMemo(() => {
    // 用户信息未加载完成时，返回空菜单
    if (!userStore.userInfo) {
      return []
    }
    return filterMenuByPermission(menuList, userStore.userInfo)
  }, [userStore.userInfo])

  // 根据当前路由计算选中的菜单项和需要展开的父菜单
  const selectedKeys = useMemo(() => {
    // 找到当前路由对应的菜单项，支持子路由自动匹配父菜单
    const selectedKey = getSelectedMenuKey(location.pathname, routes, filteredMenuList)
    return [selectedKey]
  }, [location.pathname, filteredMenuList])

  const defaultOpenKeys = useMemo(() => {
    return getOpenKeysFromPath(location.pathname)
  }, [location.pathname])

  // 使用渲染时逻辑更新状态（React 18+ 的正确模式）
  if (currentKeepAliveRoute && !visitedRoutes.has(currentKeepAliveRoute.path)) {
    // 直接在渲染期间更新状态（React 会自动重新渲染）
    setVisitedRoutes((prev) => {
      const newSet = new Set(prev)
      newSet.add(currentKeepAliveRoute.path)
      return newSet
    })
  }

  const onToggleCollapsed = () => {
    appStore.toggleCollapsed()
  }

  const items: MenuProps['items'] = [
    {
      key: 'signout',
      label: '退出登录',
      icon: <LogOut className="h-4 w-4" />,
    },
  ]

  const onDropdownClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'signout') {
      userStore.logout()
      message.success('已退出登录')
      navigate('/signin', { replace: true })
    }
  }

  return (
    <div className="basic-layout flex">
      <div className={cn(styles.asidePlaceholder, { collapsed: appStore.collapsed })}></div>
      <Sider
        className={styles.basicAside}
        width={232}
        collapsible
        collapsed={appStore.collapsed}
        collapsedWidth={64}
        trigger={null}
        theme="light"
      >
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <Menu
            selectedKeys={selectedKeys}
            defaultOpenKeys={defaultOpenKeys}
            mode="inline"
            items={filteredMenuList}
            inlineCollapsed={appStore.collapsed}
          />
        </div>
        <div className="w-full p-2 border-t">
          <Button color="default" variant="text" onClick={onToggleCollapsed}>
            <TextAlignJustify className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </Sider>

      <div className="basic-main flex-auto min-w-0 flex flex-col">
        <div className={styles.headerPlaceholder}></div>
        <div className={styles.basicHeader}>
          <div className={styles.basicContent}>
            <NavLink to="/" className="flex items-center gap-2">
              <img src={logoImg} alt="logo" width="48" />
              <h1 className="font-bold text-2xl">fftz</h1>
            </NavLink>
          </div>
          <Dropdown menu={{ items, onClick: onDropdownClick }} placement="bottom">
            <div className={styles.userInfo}>
              {/* <CircleUserRound className="h-5 w-5" /> */}
              <ComImage
                src={userStore.userInfo?.avatar}
                width={24}
                height={24}
                styles={{
                  image: {
                    borderRadius: '50%',
                    objectFit: 'cover',
                  },
                }}
              />
              {userStore.userInfo?.username}
              <ChevronDown className="h-4 w-4" />
            </div>
          </Dropdown>
        </div>

        {/* KeepAlive 路由：只渲染已访问过的路由 */}
        {keepAliveRoutes.map(({ path, Component }) => {
          // 只渲染已访问过的路由
          if (!visitedRoutes.has(path)) {
            return null
          }

          const isVisible = location.pathname === path

          return (
            <Activity key={path} mode={isVisible ? 'visible' : 'hidden'}>
              <div
                className={cn('route-transition flex-1', {
                  'route-enter': isVisible,
                  'route-exit': !isVisible,
                })}
              >
                <PermissionGuard>
                  <Component />
                </PermissionGuard>
              </div>
            </Activity>
          )
        })}

        {/* 普通路由：使用 Outlet，并包裹权限守卫 */}
        {!isKeepAliveRoute && (
          <div className="route-transition route-enter flex-1">
            <PermissionGuard>
              <Outlet />
            </PermissionGuard>
          </div>
        )}
      </div>
    </div>
  )
}

export default Basic
