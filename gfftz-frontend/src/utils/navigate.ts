import type { NavigateFunction } from 'react-router'

let globalNavigate: NavigateFunction | null = null

export const setNavigate = (navigate: NavigateFunction) => {
  globalNavigate = navigate
}

export const getNavigate = () => {
  if (!globalNavigate) {
    console.warn('Navigate function is not initialized')
  }
  return globalNavigate
}

// 便捷方法
export const navigateTo = (path: string, options?: { replace?: boolean }) => {
  const navigate = getNavigate()
  if (navigate) {
    navigate(path, options)
  }
}
