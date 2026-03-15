import { get, post, put, patch } from '@/utils/request'
import type { IToggleEnabledDto, IBatchDeleteDto } from '@/types/global'
import type {
  ResourcePaginationRes,
  IResourceQueryDto,
  ICreateResourceDto,
  IUpdateResourceDto,
  IResourceItem,
} from './types'

export const getResourceList = (data: IResourceQueryDto, signal?: AbortSignal) =>
  post<ResourcePaginationRes>('/resource/pagedList', data, { signal })
export const createResource = (data: ICreateResourceDto) => post('/resource', data)
export const updateResource = (data: IUpdateResourceDto) => put('/resource', data)
export const toggleEnabledResource = (data: IToggleEnabledDto) =>
  patch('/resource/toggleEnabled', data)
export const batchDeleteResource = (data: IBatchDeleteDto) => post('/resource/batchDelete', data)

export const getAllResourceList = () => get<IResourceItem[]>('/resource/findAll')
