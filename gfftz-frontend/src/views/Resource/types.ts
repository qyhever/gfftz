import { enumResourceType } from '@/utils/enum'
import type { Dayjs } from 'dayjs'

type ResourceType = keyof typeof enumResourceType.obj

/**
 * 资源列表项
 */
export interface IResourceItem {
  id: number
  code: string
  name: string
  type: ResourceType
  parentCode: string
  isDeleted: number
  isEnabled: number
  isSystemDefault: number
  createdAt: string
  updatedAt: string
}

/**
 * 资源分页响应
 */
export type ResourcePaginationRes = IPaginationResponse<IResourceItem>

// ============= 查询相关类型 =============

/**
 * 资源查询基础字段（公共部分）
 * - 表单和 API 都共享的字段
 */
interface IResourceQueryBase {
  currentPage: number
  pageSize: number
  sortField: string
  sortValue: 'asc' | 'desc' | ''
  code: string
  name: string
  parentCode: string
}

/**
 * 资源查询表单模型（页面绑定）
 * - 包含 UI 特有的类型（如 Dayjs）
 * - 用于表单组件、状态管理
 */
export interface IResourceQueryForm extends IResourceQueryBase {
  type: string | null
  rangeDate: [Dayjs | null, Dayjs | null] // Dayjs 对象，用于日期选择器
}

/**
 * 资源查询参数（API 请求）
 * - 已转换为后端可接收的格式
 * - 如果需要与后端约定不同的字段，在这里定义
 */
export interface IResourceQueryDto extends IResourceQueryBase {
  type: string
  createdAtStart: string // ISO 字符串
  createdAtEnd: string // ISO 字符串
}

// ============= 创建/更新相关类型 =============

/**
 * 资源表单模型（创建/编辑表单绑定）
 */
export interface IResourceSaveForm {
  code: string
  name: string
  type: string | null
  parentCode: string
  isEnabled: number
}

/**
 * 创建资源 DTO
 */
export interface ICreateResourceDto {
  code: string
  name: string
  type: string
  parentCode: string
  isEnabled: number
}

/**
 * 更新资源 DTO
 */
export interface IUpdateResourceDto extends ICreateResourceDto {
  id: number
}
