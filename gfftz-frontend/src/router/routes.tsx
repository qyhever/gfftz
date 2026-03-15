import { lazy, Suspense } from 'react'
import { Navigate, Outlet } from 'react-router'
import { Spin } from 'antd'
import { AuthGuard } from '@/components/AuthGuard'

// 懒加载高阶组件
const lazyLoad = (importFunc: () => Promise<{ default: React.FC }>) => {
  const Component = lazy(importFunc)
  return (props: React.ComponentProps<typeof Component>) => (
    <Suspense
      fallback={
        <div className="flex items-center justify-center flex-1">
          <Spin size="large" />
        </div>
      }
    >
      <Component {...props} />
    </Suspense>
  )
}

const Basic = lazyLoad(() => import('../layouts/Basic'))
const Resource = lazyLoad(() => import('../views/Resource').then((m) => ({ default: m.Resource })))
const Role = lazyLoad(() => import('../views/Role').then((m) => ({ default: m.Role })))
const CreateOrUpdateRole = lazyLoad(() =>
  import('../views/Role/CreateOrUpdateRole').then((m) => ({ default: m.CreateOrUpdateRole })),
)
const User = lazyLoad(() => import('../views/User').then((m) => ({ default: m.User })))
const CreateOrUpdateUser = lazyLoad(() =>
  import('../views/User/CreateOrUpdateUser').then((m) => ({ default: m.CreateOrUpdateUser })),
)
const Home = lazyLoad(() => import('../views/Home').then((m) => ({ default: m.Home })))
const SignIn = lazyLoad(() => import('../views/SignIn').then((m) => ({ default: m.SignIn })))
const NotFound = lazyLoad(() =>
  import('../views/Exception/NotFound').then((m) => ({ default: m.NotFound })),
)
const Forbidden = lazyLoad(() =>
  import('../views/Exception/Forbidden').then((m) => ({ default: m.Forbidden })),
)
const Clipboard = lazyLoad(() =>
  import('@/views/Blocks/Clipboard').then((m) => ({ default: m.Clipboard })),
)
const Qrcode = lazyLoad(() => import('@/views/Blocks/Qrcode').then((m) => ({ default: m.Qrcode })))
const StepsWithRouter = lazyLoad(() =>
  import('@/views/Forms/StepsWithRouter').then((m) => ({ default: m.StepsWithRouter })),
)
const BadSearch = lazyLoad(() =>
  import('@/views/Forms/BadSearch').then((m) => ({ default: m.BadSearch })),
)
const AntdForm = lazyLoad(() =>
  import('@/views/Forms/Linkage/AntdForm').then((m) => ({ default: m.AntdForm })),
)
const ReactHookForm = lazyLoad(() =>
  import('@/views/Forms/Linkage/ReactHookForm').then((m) => ({ default: m.ReactHookForm })),
)
const Items = lazyLoad(() => import('@/views/Forms/Items').then((m) => ({ default: m.Items })))
const Steps = lazyLoad(() => import('@/views/Forms/Steps').then((m) => ({ default: m.Steps })))
const InTable = lazyLoad(() =>
  import('@/views/Forms/InTable').then((m) => ({ default: m.InTable })),
)

export const routes = [
  {
    index: true,
    element: <Navigate to="/home" replace />,
  },
  {
    path: 'signin',
    Component: SignIn,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <Basic />
      </AuthGuard>
    ),
    children: [
      {
        path: 'home',
        Component: Home,
        resourceCode: 'home',
      },
      {
        path: 'resource',
        Component: Resource,
        keepAlive: true,
        resourceCode: 'resource',
      },
      {
        path: 'role',
        Component: Role,
        keepAlive: true,
        resourceCode: 'role',
      },
      {
        path: 'role/create',
        Component: CreateOrUpdateRole,
        resourceCode: 'role',
      },
      {
        path: 'role/update',
        Component: CreateOrUpdateRole,
        resourceCode: 'role',
      },
      {
        path: 'user',
        Component: User,
        resourceCode: 'user',
      },
      {
        path: 'user/create',
        Component: CreateOrUpdateUser,
        resourceCode: 'user',
      },
      {
        path: 'user/update',
        Component: CreateOrUpdateUser,
        resourceCode: 'user',
      },
      {
        path: 'blocks/clipboard',
        Component: Clipboard,
        resourceCode: 'clipboard',
      },
      {
        path: 'blocks/qrcode',
        Component: Qrcode,
        resourceCode: 'qrcode',
      },
      {
        path: 'forms/badsearch',
        Component: BadSearch,
      },
      {
        path: 'forms/linkage/antd',
        Component: AntdForm,
      },
      {
        path: 'forms/linkage/react-hook-form',
        Component: ReactHookForm,
      },
      {
        path: 'forms/items',
        Component: Items,
      },
      {
        path: 'forms/steps',
        Component: Steps,
      },
      {
        path: 'forms/intable',
        Component: InTable,
      },
      {
        path: 'forms/steps-router/*',
        Component: StepsWithRouter,
        menuKey: '/forms/steps', // 指定激活的菜单项
      },
    ],
  },
  {
    element: (
      <AuthGuard>
        <Outlet />
      </AuthGuard>
    ),
    children: [
      {
        path: 'charts/brithday',
        element: <div>brithday</div>,
      },
      {
        path: 'charts/dead',
        element: <div>dead</div>,
      },
    ],
  },
  {
    path: '/forbidden',
    Component: Forbidden,
  },
  {
    path: '*',
    Component: NotFound,
  },
]
