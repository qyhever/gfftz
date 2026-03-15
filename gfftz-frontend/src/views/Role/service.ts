import { get, post, put, patch } from '@/utils/request'
import type { IToggleEnabledDto, IBatchDeleteDto } from '@/types/global'
import type {
  RolePaginationRes,
  IRoleQueryDto,
  ICreateRoleDto,
  IUpdateRoleDto,
  IRoleDetailRes,
  IRoleItem,
} from './types'

export const getRoleList = (data: IRoleQueryDto, signal?: AbortSignal) =>
  post<RolePaginationRes>('/role/pagedList', data, { signal })
export const createRole = (data: ICreateRoleDto) => post('/role', data)
export const updateRole = (data: IUpdateRoleDto) => put('/role', data)
export const toggleEnabledRole = (data: IToggleEnabledDto) => patch('/role/toggleEnabled', data)
export const batchDeleteRole = (data: IBatchDeleteDto) => post('/role/batchDelete', data)
export const getRoleById = (id: number) => get<IRoleDetailRes>(`/role/${id}`)

export const getAllRoleList = () => get<IRoleItem[]>('/role/findAll')
