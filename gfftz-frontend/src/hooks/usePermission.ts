import { useUserStore } from '@/stores/user'
import { hasResourcePermission, getUserResourceCodes } from '@/utils/permission'

/**
 * 权限判断 Hook
 * 用于在组件中判断用户是否有指定资源的权限
 */
export function usePermission() {
  const userStore = useUserStore()

  /**
   * 检查是否有指定资源权限
   */
  const hasPermission = (resourceCode: string): boolean => {
    return hasResourcePermission(userStore.userInfo, resourceCode)
  }

  /**
   * 检查是否有指定资源列表中的任意一个权限
   */
  const hasAnyPermission = (resourceCodes: string[]): boolean => {
    return resourceCodes.some((code) => hasPermission(code))
  }

  /**
   * 检查是否同时拥有所有指定资源权限
   */
  const hasAllPermissions = (resourceCodes: string[]): boolean => {
    return resourceCodes.every((code) => hasPermission(code))
  }

  /**
   * 获取用户所有可访问的资源码
   */
  const getResourceCodes = (): Set<string> => {
    return getUserResourceCodes(userStore.userInfo)
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getResourceCodes,
  }
}
