import { Button } from 'antd'
import type { ButtonProps } from 'antd'
import { usePermission } from '@/hooks/usePermission'

interface IPermissionButtonProps extends ButtonProps {
  /** 权限资源码，不传表示无需权限 */
  resourceCode?: string
  /** 无权限时是否隐藏（默认 false，显示禁用状态） */
  hideWhenNoPermission?: boolean
}

/**
 * 带权限控制的按钮组件
 * - 有权限：正常显示并可点击
 * - 无权限且 hideWhenNoPermission=false：显示但禁用
 * - 无权限且 hideWhenNoPermission=true：不显示
 */
export const PermissionButton: React.FC<IPermissionButtonProps> = ({
  resourceCode,
  hideWhenNoPermission = false,
  disabled,
  ...restProps
}) => {
  const { hasPermission } = usePermission()

  // 如果没有配置 resourceCode，表示不需要权限
  const hasAuth = !resourceCode || hasPermission(resourceCode)

  // 无权限且设置隐藏，则不渲染
  if (!hasAuth && hideWhenNoPermission) {
    return null
  }

  // 无权限时禁用按钮
  return <Button {...restProps} disabled={disabled || !hasAuth} />
}
