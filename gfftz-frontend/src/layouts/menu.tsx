import { NavLink } from 'react-router'
import { Home, Layers, Shield, User, Box, Form } from 'lucide-react'

// 扩展菜单项类型，添加 resourceCode
export interface ExtendedMenuItem {
  key: React.Key
  label?: React.ReactNode
  icon?: React.ReactNode
  resourceCode?: string // 权限资源码
  children?: ExtendedMenuItem[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any // 允许其他 Ant Design Menu 属性
}

export const menuList: ExtendedMenuItem[] = [
  {
    key: '/home',
    label: <NavLink to="/home">首页</NavLink>,
    icon: <Home className="h-4 w-4" />,
    resourceCode: 'home',
  },
  {
    key: '/resource',
    label: <NavLink to="/resource">资源管理</NavLink>,
    icon: <Layers className="h-4 w-4" />,
    resourceCode: 'resource',
  },
  {
    key: '/role',
    label: <NavLink to="/role">角色管理</NavLink>,
    icon: <Shield className="h-4 w-4" />,
    resourceCode: 'role',
  },
  {
    key: '/user',
    label: <NavLink to="/user">用户管理</NavLink>,
    icon: <User className="h-4 w-4" />,
    resourceCode: 'user',
  },
  {
    key: '/blocks',
    label: '组件',
    icon: <Box className="h-4 w-4" />,
    resourceCode: 'component',
    children: [
      {
        key: '/blocks/clipboard',
        label: <NavLink to="/blocks/clipboard">复制</NavLink>,
        resourceCode: 'clipboard',
      },
      {
        key: '/blocks/qrcode',
        label: <NavLink to="/blocks/qrcode">二维码</NavLink>,
        resourceCode: 'qrcode',
      },
    ],
  },
  {
    key: '/forms',
    label: '表单',
    icon: <Form className="h-4 w-4" />,
    children: [
      {
        key: '/forms/linkage',
        label: '表单联动',
        children: [
          {
            key: '/forms/linkage/antd',
            label: <NavLink to="/forms/linkage/antd">Antd Form</NavLink>,
          },
          {
            key: '/forms/linkage/react-hook-form',
            label: <NavLink to="/forms/linkage/react-hook-form">React Hook Form</NavLink>,
          },
        ],
      },
      {
        key: '/forms/items',
        label: <NavLink to="/forms/items">列表表单</NavLink>,
      },
      {
        key: '/forms/steps',
        label: <NavLink to="/forms/steps">分步表单</NavLink>,
      },
      {
        key: '/forms/intable',
        label: <NavLink to="/forms/intable">表格内嵌表单</NavLink>,
      },
    ],
  },
]
