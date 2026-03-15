// ============= 业务类型定义 =============

/**
 * 用户信息
 */
export interface IUserInfo {
  id: number
  username: string
  mobile: string
  avatar: string
  isDeleted: number
  isEnabled: number
  createdAt: string
  updatedAt: string
  roles: {
    code: string
    name: string
  }[]
  resources: {
    code: string
    name: string
  }[]
}

/**
 * 启用/禁用操作 DTO
 */
export interface IToggleEnabledDto {
  id: number
  isEnabled: BooleanEnum
}

/**
 * 批量删除操作 DTO
 */
export interface IBatchDeleteDto {
  ids: Array<number | string>
}
