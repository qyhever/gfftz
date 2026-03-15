import type { Dayjs } from 'dayjs'
import type { IResourceItem } from '../Resource/types'

/**
 * 角色列表项
 */
export interface IRoleItem {
  id: number
  code: string
  name: string
  description: string
  isDeleted: number
  isEnabled: number
  isSystemDefault: number
  createdAt: string
  updatedAt: string
}

/**
 * 角色分页响应
 */
export type RolePaginationRes = IPaginationResponse<IRoleItem>

/**
 * 角色查询基础字段（公共部分）
 * - 表单和 API 都共享的字段
 */
interface IRoleQueryBase {
  currentPage: number
  pageSize: number
  sortField: string
  sortValue: 'asc' | 'desc' | ''
  code: string
  name: string
}

/**
 * 角色查询表单模型（页面绑定）
 */
export interface IRoleQueryForm extends IRoleQueryBase {
  rangeDate: [Dayjs | null, Dayjs | null] // Dayjs 对象，用于日期选择器
}

/**
 * 角色查询参数（API 请求）
 */
export interface IRoleQueryDto extends IRoleQueryBase {
  createdAtStart: string // ISO 字符串
  createdAtEnd: string // ISO 字符串
}

/**
 * 角色表单模型（创建/编辑表单绑定）
 */
export interface IRoleSaveForm {
  code: string
  name: string
  description: string
  isEnabled: number
  resourceCodes: string[]
}

/**
 * 创建角色 DTO
 */
export interface ICreateRoleDto {
  code: string
  name: string
  description: string
  isEnabled: number
  resourceCodes: string[]
}

/**
 * 更新角色 DTO
 */
export interface IUpdateRoleDto extends ICreateRoleDto {
  id: number
}

export interface ITreeResourceNode extends IResourceItem {
  title: string
  key: string
  children: ITreeResourceNode[]
  [key: string]: unknown
}

export interface IRoleDetailRes {
  id: number
  code: string
  name: string
  description: string
  isDeleted: number
  isEnabled: number
  isSystemDefault: number
  createdAt: string
  updatedAt: string
  resources: IResourceItem[]
}
