import type { Dayjs } from 'dayjs'
import type { IRoleItem } from '../Role/types'

/**
 * 用户列表项
 */
export interface IUserItem {
  id: number
  avatar: string
  name: string
  mobile: string
  isDeleted: number
  isEnabled: number
  isSystemDefault: number
  createdAt: string
  updatedAt: string
  roles: IRoleItem[]
}

/**
 * 用户分页响应
 */
export type UserPaginationRes = IPaginationResponse<IUserItem>

/**
 * 用户查询基础字段（公共部分）
 * - 表单和 API 都共享的字段
 */
interface IUserQueryBase {
  currentPage: number
  pageSize: number
  sortField: string
  sortValue: 'asc' | 'desc' | ''
  mobile: string
  username: string
}

/**
 * 用户查询表单模型（页面绑定）
 */
export interface IUserQueryForm extends IUserQueryBase {
  rangeDate: [Dayjs | null, Dayjs | null] // Dayjs 对象，用于日期选择器
}

/**
 * 用户查询参数（API 请求）
 */
export interface IUserQueryDto extends IUserQueryBase {
  createdAtStart: string // ISO 字符串
  createdAtEnd: string // ISO 字符串
}

/**
 * 用户表单模型（创建/编辑表单绑定）
 */
export interface IUserSaveForm {
  avatar: string
  username: string
  password: string
  mobile: string
  isEnabled: number
  roleCodes: string[]
}

/**
 * 创建用户 DTO
 */
export interface ICreateUserDto {
  avatar: string
  username: string
  password: string
  mobile: string
  isEnabled: number
  roleCodes: string[]
}

/**
 * 更新用户 DTO
 */
export interface IUpdateUserDto extends ICreateUserDto {
  id: number
}
